import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  category: string;
  is_hazardous_only: boolean;
  status: string;
  created_at: string;
}

const QuestionManagement = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  
  const [form, setForm] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A",
    category: "general",
    is_hazardous_only: false,
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("traffic_law_questions")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setQuestions(data);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "A",
      category: "general",
      is_hazardous_only: false,
    });
  };

  const handleAdd = async () => {
    if (!form.question || !form.option_a || !form.option_b || !form.option_c || !form.option_d) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const { error } = await supabase.from("traffic_law_questions").insert({
        question: form.question,
        option_a: form.option_a,
        option_b: form.option_b,
        option_c: form.option_c,
        option_d: form.option_d,
        correct_answer: form.correct_answer,
        category: form.category,
        is_hazardous_only: form.is_hazardous_only,
      });

      if (error) throw error;

      toast.success("Question added successfully");
      setIsAddOpen(false);
      resetForm();
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || "Failed to add question");
    }
  };

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setForm({
      question: question.question,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_answer: question.correct_answer,
      category: question.category,
      is_hazardous_only: question.is_hazardous_only,
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedQuestion) return;

    if (!form.question || !form.option_a || !form.option_b || !form.option_c || !form.option_d) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const { error } = await supabase
        .from("traffic_law_questions")
        .update({
          question: form.question,
          option_a: form.option_a,
          option_b: form.option_b,
          option_c: form.option_c,
          option_d: form.option_d,
          correct_answer: form.correct_answer,
          category: form.category,
          is_hazardous_only: form.is_hazardous_only,
        })
        .eq("id", selectedQuestion.id);

      if (error) throw error;

      toast.success("Question updated successfully");
      setIsEditOpen(false);
      resetForm();
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || "Failed to update question");
    }
  };

  const handleDelete = async () => {
    if (!selectedQuestion) return;

    try {
      const { error } = await supabase
        .from("traffic_law_questions")
        .delete()
        .eq("id", selectedQuestion.id);

      if (error) throw error;

      toast.success("Question deleted successfully");
      setIsDeleteOpen(false);
      setSelectedQuestion(null);
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete question");
    }
  };

  const handleToggleStatus = async (question: Question) => {
    const newStatus = question.status === "active" ? "inactive" : "active";
    
    try {
      const { error } = await supabase
        .from("traffic_law_questions")
        .update({ status: newStatus })
        .eq("id", question.id);

      if (error) throw error;

      toast.success(`Question ${newStatus === "active" ? "activated" : "deactivated"}`);
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const categories = [
    { value: "general", label: "General Traffic Rules" },
    { value: "speed_limits", label: "Speed Limits" },
    { value: "lane_discipline", label: "Lane Discipline" },
    { value: "right_of_way", label: "Right of Way" },
    { value: "alcohol_drugs", label: "Alcohol & Drug Penalties" },
    { value: "commercial", label: "Commercial Driver" },
    { value: "hazard_signage", label: "Hazard Signage" },
  ];

  const QuestionForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Question *</Label>
        <Textarea
          placeholder="Enter the question"
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Option A *</Label>
          <Input
            placeholder="Option A"
            value={form.option_a}
            onChange={(e) => setForm({ ...form, option_a: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Option B *</Label>
          <Input
            placeholder="Option B"
            value={form.option_b}
            onChange={(e) => setForm({ ...form, option_b: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Option C *</Label>
          <Input
            placeholder="Option C"
            value={form.option_c}
            onChange={(e) => setForm({ ...form, option_c: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Option D *</Label>
          <Input
            placeholder="Option D"
            value={form.option_d}
            onChange={(e) => setForm({ ...form, option_d: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Correct Answer *</Label>
          <Select value={form.correct_answer} onValueChange={(v) => setForm({ ...form, correct_answer: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="D">D</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background">
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="hazardous"
          checked={form.is_hazardous_only}
          onCheckedChange={(checked) => setForm({ ...form, is_hazardous_only: checked as boolean })}
        />
        <Label htmlFor="hazardous">Hazardous vehicle drivers only</Label>
      </div>

      <SheetFooter>
        <Button onClick={onSubmit}>{submitLabel}</Button>
      </SheetFooter>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Traffic Law Questions
            </CardTitle>
            <CardDescription>Manage MCQ question bank for driving tests</CardDescription>
          </div>
          <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Question</TableHead>
                <TableHead className="w-24">Answer</TableHead>
                <TableHead className="w-32">Category</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No questions added yet. Click "Add Question" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((q, idx) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{idx + 1}</TableCell>
                    <TableCell className="max-w-md truncate">{q.question}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{q.correct_answer}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {categories.find((c) => c.value === q.category)?.label || q.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={q.status === "active" ? "success" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => handleToggleStatus(q)}
                      >
                        {q.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(q)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => { setSelectedQuestion(q); setIsDeleteOpen(true); }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add Question Sheet */}
        <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add Question</SheetTitle>
              <SheetDescription>Create a new traffic law MCQ</SheetDescription>
            </SheetHeader>
            <QuestionForm onSubmit={handleAdd} submitLabel="Add Question" />
          </SheetContent>
        </Sheet>

        {/* Edit Question Sheet */}
        <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Question</SheetTitle>
              <SheetDescription>Modify the question details</SheetDescription>
            </SheetHeader>
            <QuestionForm onSubmit={handleSaveEdit} submitLabel="Save Changes" />
          </SheetContent>
        </Sheet>

        {/* Delete Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Question</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this question? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default QuestionManagement;
