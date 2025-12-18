import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Clock, FileText, LogIn, AlertTriangle } from "lucide-react";

interface TrafficQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  image_url?: string | null;
  // Store shuffled option mapping for server-side validation
  originalOptions: { key: string; value: string }[];
}

interface TestSession {
  id: string;
  application_id: string;
  status: string;
  score: number | null;
  total_questions: number;
  answers: any;
  started_at: string | null;
  completed_at: string | null;
}

const TrafficTestPortal = () => {
  const [testUserId, setTestUserId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [session, setSession] = useState<TestSession | null>(null);
  const [questions, setQuestions] = useState<TrafficQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);

  // Timer countdown
  useEffect(() => {
    if (!isAuthenticated || !session || session.status === "completed") return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthenticated, session]);

  // Check lockout status
  const isLockedOut = () => {
    if (!lockoutUntil) return false;
    return new Date() < lockoutUntil;
  };

  // Calculate lockout time based on attempts (exponential backoff)
  const getLockoutDuration = (attempts: number) => {
    if (attempts < 3) return 0;
    // 30s, 60s, 120s, 240s...
    return Math.min(30 * Math.pow(2, attempts - 3), 300) * 1000;
  };

  const handleLogin = async () => {
    if (!testUserId.trim() || !secretKey.trim()) {
      toast.error("Please enter both User ID and Secret Key");
      return;
    }

    // Check client-side lockout
    if (isLockedOut()) {
      const remainingSeconds = Math.ceil((lockoutUntil!.getTime() - Date.now()) / 1000);
      toast.error(`Too many attempts. Please wait ${remainingSeconds} seconds.`);
      return;
    }

    setLoading(true);
    try {
      // Check server-side rate limiting first
      const { data: canProceed } = await supabase.rpc("check_traffic_test_rate_limit", {
        p_test_user_id: testUserId.trim(),
      });

      if (canProceed === false) {
        toast.error("Too many failed attempts. Please wait 15 minutes before trying again.");
        setLockoutUntil(new Date(Date.now() + 15 * 60 * 1000));
        return;
      }

      // Find session by credentials
      const { data: sessionData, error: sessionError } = await supabase
        .from("traffic_test_sessions")
        .select("*")
        .eq("test_user_id", testUserId.trim())
        .eq("secret_key", secretKey.trim())
        .maybeSingle();

      if (sessionError) throw sessionError;
      
      if (!sessionData) {
        // Log failed attempt
        await supabase.from("traffic_test_login_attempts").insert({
          test_user_id: testUserId.trim(),
          success: false,
        });
        
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        // Apply exponential backoff after 3 failed attempts
        const lockoutDuration = getLockoutDuration(newAttempts);
        if (lockoutDuration > 0) {
          setLockoutUntil(new Date(Date.now() + lockoutDuration));
          toast.error(`Invalid credentials. Please wait ${lockoutDuration / 1000} seconds before trying again.`);
        } else {
          toast.error("Invalid credentials. Please check your User ID and Secret Key.");
        }
        return;
      }

      // Check if session is expired
      if (sessionData.expires_at && new Date(sessionData.expires_at) < new Date()) {
        toast.error("This test session has expired. Please contact your driving school.");
        return;
      }

      // Log successful attempt
      await supabase.from("traffic_test_login_attempts").insert({
        test_user_id: testUserId.trim(),
        success: true,
      });
      
      // Reset login attempts on success
      setLoginAttempts(0);
      setLockoutUntil(null);

      if (sessionData.status === "completed") {
        setSession(sessionData);
        setIsAuthenticated(true);
        toast.info("This test has already been completed");
        return;
      }

      // Fetch questions from secure view (no correct answers exposed)
      const { data: questionsData } = await supabase
        .from("traffic_questions_public")
        .select("*")
        .limit(25);

      if (questionsData) {
        // Shuffle and pick 20 questions, then shuffle options for each
        const shuffled = questionsData.sort(() => 0.5 - Math.random()).slice(0, 20);
        
        // Shuffle options for each question
        const shuffledWithOptions: TrafficQuestion[] = shuffled.map((q) => {
          const options = [
            { key: "A", value: q.option_a },
            { key: "B", value: q.option_b },
            { key: "C", value: q.option_c },
            { key: "D", value: q.option_d },
          ];
          
          // Fisher-Yates shuffle for options
          for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
          }
          
          return {
            id: q.id,
            question: q.question,
            option_a: options[0].value,
            option_b: options[1].value,
            option_c: options[2].value,
            option_d: options[3].value,
            image_url: q.image_url,
            originalOptions: options, // Store for server-side validation
          };
        });
        
        setQuestions(shuffledWithOptions);
      }

      // Update session if first login
      if (!sessionData.started_at) {
        await supabase
          .from("traffic_test_sessions")
          .update({ 
            started_at: new Date().toISOString(),
            status: "in_progress"
          })
          .eq("id", sessionData.id);
      }

      setSession(sessionData);
      setAnswers((sessionData.answers as Record<string, string>) || {});
      setIsAuthenticated(true);
      toast.success("Login successful! You may begin your test.");
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitTest = async () => {
    if (!session) return;

    setSubmitting(true);
    try {
      // Calculate score using server-side validation
      let score = 0;
      for (const q of questions) {
        const selectedAnswer = answers[q.id];
        if (selectedAnswer) {
          // Map the displayed answer back to original key
          const originalKey = q.originalOptions[["a", "b", "c", "d"].indexOf(selectedAnswer.toLowerCase())]?.key;
          if (originalKey) {
            const { data } = await supabase.rpc("validate_traffic_answer", {
              _question_id: q.id,
              _selected_answer: originalKey,
            });
            if (data === true) score++;
          }
        }
      }

      const scaledScore = Math.round((score / Math.max(questions.length, 1)) * 20);

      // Update session
      const { error } = await supabase
        .from("traffic_test_sessions")
        .update({
          status: "completed",
          score: scaledScore,
          answers: answers,
          completed_at: new Date().toISOString(),
        })
        .eq("id", session.id);

      if (error) throw error;

      // Update driving test results if exists
      const { data: drivingResult } = await supabase
        .from("driving_test_results")
        .select("id")
        .eq("application_id", session.application_id)
        .maybeSingle();

      if (drivingResult) {
        await supabase
          .from("driving_test_results")
          .update({
            traffic_test_score: scaledScore,
            traffic_test_answers: answers,
            traffic_test_passed: scaledScore >= 12,
          })
          .eq("id", drivingResult.id);
      }

      setSession({ ...session, status: "completed", score: scaledScore });
      toast.success("Test submitted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit test");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Traffic Law Test Portal</CardTitle>
            <CardDescription>
              Enter your credentials provided by the driving school
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                placeholder="Enter your test User ID"
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                placeholder="Enter your Secret Key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleLogin} 
              disabled={loading}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? "Verifying..." : "Start Test"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completed Screen
  if (session?.status === "completed") {
    const passed = (session.score || 0) >= 12;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
              passed ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
            }`}>
              {passed ? (
                <CheckCircle className="w-10 h-10 text-green-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </div>
            <CardTitle className="text-2xl">Test Completed</CardTitle>
            <CardDescription>
              Your results have been submitted to the driving school
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 bg-muted rounded-lg">
              <p className="text-4xl font-bold">{session.score}/20</p>
              <p className="text-sm text-muted-foreground mt-1">
                Passing Score: 12/20
              </p>
            </div>
            <Badge 
              variant={passed ? "default" : "destructive"} 
              className="text-lg px-4 py-1"
            >
              {passed ? "PASSED" : "FAILED"}
            </Badge>
            <p className="text-sm text-muted-foreground">
              You may now close this window. Results have been automatically sent to the driving school.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Test Screen
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Traffic Law Test</h1>
                <p className="text-sm text-muted-foreground">
                  Answer all questions carefully
                </p>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-2 text-lg font-mono ${
                  timeLeft < 300 ? "text-destructive" : ""
                }`}>
                  <Clock className="w-5 h-5" />
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {answeredCount}/{questions.length} answered
                </p>
              </div>
            </div>
            <Progress value={progress} className="mt-3" />
          </CardContent>
        </Card>

        {/* Questions */}
        {questions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p>No questions available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((q, index) => (
              <Card key={q.id} className={answers[q.id] ? "border-primary/50" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-start gap-2">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                      Q{index + 1}
                    </span>
                    <span className="flex-1">{q.question}</span>
                  </CardTitle>
                  {q.image_url && (
                    <div className="mt-3 flex justify-center">
                      <img 
                        src={q.image_url} 
                        alt="Question image" 
                        className="max-w-[200px] max-h-[150px] object-contain rounded border"
                      />
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={answers[q.id] || ""}
                    onValueChange={(value) => handleAnswerChange(q.id, value)}
                  >
                    {["a", "b", "c", "d"].map((opt) => {
                      const optionKey = `option_${opt}` as "option_a" | "option_b" | "option_c" | "option_d";
                      return (
                        <div key={opt} className="flex items-center space-x-2 py-1">
                          <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                          <Label 
                            htmlFor={`${q.id}-${opt}`} 
                            className="flex-1 cursor-pointer"
                          >
                            {q[optionKey]}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}

            {/* Submit Button */}
            <Card className="border-primary">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ready to submit?</p>
                    <p className="text-sm text-muted-foreground">
                      {answeredCount < questions.length 
                        ? `You have ${questions.length - answeredCount} unanswered questions`
                        : "All questions answered!"
                      }
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={handleSubmitTest}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Test"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrafficTestPortal;