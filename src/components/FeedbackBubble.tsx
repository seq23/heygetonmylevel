import { useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

const FeedbackBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<string>("general");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const { t } = useLanguage();

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: t("feedback.enterMessage"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-feedback", {
        body: {
          type: feedbackType,
          message: message.trim(),
          url: window.location.href,
        },
      });

      if (error) throw error;

      toast({
        title: t("feedback.sent"),
        description: t("feedback.thanks"),
      });
      setMessage("");
      setFeedbackType("general");
      setIsOpen(false);
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast({
        title: t("feedback.failed"),
        description: t("feedback.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (location.pathname.startsWith("/session")) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-card border rounded-xl shadow-lg w-80 p-4 animate-in slide-in-from-bottom-2" role="dialog" aria-labelledby="feedback-title">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground" id="feedback-title">{t("feedback.title")}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={t("feedback.close")}
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-3">
            <Select value={feedbackType} onValueChange={setFeedbackType}>
              <SelectTrigger>
                <SelectValue placeholder={t("feedback.type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">{t("feedback.bug")}</SelectItem>
                <SelectItem value="feature">{t("feedback.feature")}</SelectItem>
                <SelectItem value="general">{t("feedback.general")}</SelectItem>
              </SelectContent>
            </Select>

            <div className="space-y-1.5">
              <p className="text-xs text-destructive/80 flex items-center gap-1.5">
                <span>{t("feedback.noPersonal")}</span>
              </p>
              <Textarea
                placeholder={t("feedback.placeholder")}
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                rows={4}
                className="resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {message.length}/500 {t("feedback.characters")}
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !message.trim()}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("feedback.sending")}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t("feedback.send")}
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-colors"
          aria-label={t("feedback.open")}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default FeedbackBubble;