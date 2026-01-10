import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Plus, Settings, List } from "lucide-react";

import FormTemplateEditor from "../components/forms/FormTemplateEditor";
import FormSubmissionList from "../components/forms/FormSubmissionList";
import FormAnalytics from "../components/forms/FormAnalytics";

export default function FormBuilder() {
  const [activeTab, setActiveTab] = useState("templates");
  const [showEditor, setShowEditor] = useState(false);
  const queryClient = useQueryClient();

  const { data: templates = [] } = useScopedEntity('FormTemplate', { limit: 100 });
  const { data: submissions = [] } = useScopedEntity('FormSubmission', { limit: 100 });

  const crmForms = templates.filter(t => t.form_category === 'crm');
  const tmsForms = templates.filter(t => t.form_category === 'tms');
  const complianceForms = templates.filter(t => t.form_category === 'compliance');
  const financeForms = templates.filter(t => t.form_category === 'finance');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Intelligent Form System
            </h1>
            <p className="text-slate-600 mt-2">Paperless forms with dual CRM/TMS sync</p>
          </div>
          <Button onClick={() => setShowEditor(!showEditor)} className="bg-gradient-to-r from-indigo-600 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Form Template
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">CRM Forms</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{crmForms.length}</p>
                </div>
                <FileText className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">TMS Forms</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{tmsForms.length}</p>
                </div>
                <FileText className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Compliance</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{complianceForms.length}</p>
                </div>
                <FileText className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Submissions</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{submissions.length}</p>
                </div>
                <List className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {showEditor && (
          <FormTemplateEditor onClose={() => setShowEditor(false)} />
        )}

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="templates">Form Templates</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="templates">
                <div className="space-y-4">
                  {['crm', 'tms', 'compliance', 'finance'].map(category => {
                    const categoryForms = templates.filter(t => t.form_category === category);
                    if (categoryForms.length === 0) return null;
                    
                    return (
                      <div key={category}>
                        <h3 className="font-bold text-lg text-slate-900 mb-3 capitalize">{category} Forms</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {categoryForms.map(template => (
                            <Card key={template.id} className="border border-slate-200">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <p className="font-bold text-slate-900">{template.form_name}</p>
                                  <Badge className="bg-indigo-600">{template.form_type}</Badge>
                                </div>
                                <p className="text-xs text-slate-600 mb-3">{template.fields?.length || 0} fields</p>
                                <div className="flex gap-2">
                                  {template.sync_to_crm && <Badge variant="outline" className="text-xs">CRM</Badge>}
                                  {template.sync_to_tms && <Badge variant="outline" className="text-xs">TMS</Badge>}
                                  {template.requires_signature && <Badge variant="outline" className="text-xs">Signature</Badge>}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="submissions">
                <FormSubmissionList submissions={submissions} />
              </TabsContent>

              <TabsContent value="analytics">
                <FormAnalytics submissions={submissions} templates={templates} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}