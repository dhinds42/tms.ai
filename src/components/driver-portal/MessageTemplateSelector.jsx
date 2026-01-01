import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";

export default function MessageTemplateSelector({ loadId }) {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [messageText, setMessageText] = useState('');
  const queryClient = useQueryClient();

  const { data: templates } = useQuery({
    queryKey: ['messageTemplates', 'driver'],
    queryFn: () => base44.entities.MessageTemplate.filter({ role: 'driver' }),
    initialData: []
  });

  const { data: messages } = useQuery({
    queryKey: ['loadMessages', loadId],
    queryFn: () => base44.entities.LoadMessage.filter({ load_id: loadId }),
    initialData: [],
    enabled: !!loadId
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => base44.entities.LoadMessage.create(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loadMessages'] });
      setMessageText('');
      setSelectedTemplate('');
    }
  });

  const handleTemplateSelect = (templateKey) => {
    setSelectedTemplate(templateKey);
    const template = templates.find(t => t.template_key === templateKey);
    if (template) {
      setMessageText(template.template_text);
    }
  };

  const handleSend = () => {
    if (!messageText.trim()) return;

    sendMessageMutation.mutate({
      load_id: loadId,
      template_key: selectedTemplate || null,
      message_text: messageText,
      recipient_ids: [] // Will be resolved by system
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            Send Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-slate-600 mb-1 block">Quick Template</label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Custom Message</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.template_key}>
                    {template.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message... (template variables will be auto-filled)"
              rows={4}
            />
            <p className="text-xs text-slate-500 mt-1">
              Variables like {'{{load_number}}'}, {'{{pickup_city}}'} will be auto-replaced
            </p>
          </div>

          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            className="w-full bg-indigo-600"
          >
            <Send className="w-4 h-4 mr-2" />
            {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
          </Button>
        </CardContent>
      </Card>

      {/* Message Thread */}
      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Message Thread</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg ${
                  msg.sender_role === 'driver' ? 'bg-indigo-50 ml-4' : 'bg-slate-50 mr-4'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-semibold text-slate-900 capitalize">
                    {msg.sender_role}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(msg.sent_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{msg.message_text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}