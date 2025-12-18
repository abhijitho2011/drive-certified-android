import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { test_user_id, secret_key, session_id, answers, questions } = await req.json();

    // Validate required fields
    if (!test_user_id || !secret_key || !session_id || !answers) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Validate session credentials (server-side validation of secret_key)
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("traffic_test_sessions")
      .select("*")
      .eq("id", session_id)
      .eq("test_user_id", test_user_id)
      .eq("secret_key", secret_key)
      .maybeSingle();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: "Invalid session credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if session is already completed
    if (session.status === "completed") {
      return new Response(
        JSON.stringify({ error: "Test already completed", score: session.score }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if session is expired
    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Test session has expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate score using server-side validation
    let score = 0;
    const questionIds = questions?.map((q: any) => q.id) || [];
    
    for (const q of questions || []) {
      const selectedAnswer = answers[q.id];
      if (selectedAnswer && q.originalOptions) {
        // Map the displayed answer back to original key
        const optionIndex = ["a", "b", "c", "d"].indexOf(selectedAnswer.toLowerCase());
        const originalKey = q.originalOptions[optionIndex]?.key;
        
        if (originalKey) {
          const { data } = await supabaseAdmin.rpc("validate_traffic_answer", {
            _question_id: q.id,
            _selected_answer: originalKey,
          });
          if (data === true) score++;
        }
      }
    }

    const totalQuestions = questions?.length || 20;
    const scaledScore = Math.round((score / Math.max(totalQuestions, 1)) * 20);

    // Update session with results
    const { error: updateError } = await supabaseAdmin
      .from("traffic_test_sessions")
      .update({
        status: "completed",
        score: scaledScore,
        answers: answers,
        completed_at: new Date().toISOString(),
      })
      .eq("id", session_id);

    if (updateError) {
      throw updateError;
    }

    // Update driving test results if exists
    const { data: drivingResult } = await supabaseAdmin
      .from("driving_test_results")
      .select("id")
      .eq("application_id", session.application_id)
      .maybeSingle();

    if (drivingResult) {
      await supabaseAdmin
        .from("driving_test_results")
        .update({
          traffic_test_score: scaledScore,
          traffic_test_answers: answers,
          traffic_test_passed: scaledScore >= 12,
        })
        .eq("id", drivingResult.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        score: scaledScore,
        passed: scaledScore >= 12
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in submit-traffic-test:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
