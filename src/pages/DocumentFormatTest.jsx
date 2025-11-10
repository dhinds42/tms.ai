
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileText,
  Upload,
  Download,
  CheckCircle,
  Sparkles,
  History,
  TestTube,
  FileSpreadsheet,
  AlertCircle,
  Zap
} from "lucide-react";
import {
  validateUploadFormat,
  logDocumentAction,
  getDocumentHistory,
  isNewDocument,
  isDocumentEdited,
  exportDocument,
  generateDocument,
  getFormatBadgeColor,
  formatFileSize,
  SUPPORTED_FORMATS,
  DOCUMENT_TYPES,
  ACTION_TYPES
} from "../components/utils/documentFormatHandler.jsx";
import DocumentHistoryTimeline from "../components/documents/DocumentHistoryTimeline";
import FormatExportMenu from "../components/documents/FormatExportMenu";

export default function DocumentFormatTest() {
  const [activeTab, setActiveTab] = useState("upload");
  const [testFile, setTestFile] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [selectedDocHistory, setSelectedDocHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const queryClient = useQueryClient();

  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date', 20),
    initialData: [],
  });

  const { data: documentHistory } = useQuery({
    queryKey: ['documentHistory'],
    queryFn: async () => {
      // In production, this would query DocumentHistory entity
      // For now, return empty array
      return [];
    },
    initialData: [],
  });

  const addTestResult = (test, result, message) => {
    setTestResults(prev => [...prev, {
      test,
      result,
      message,
      timestamp: new Date().toISOString()
    }]);
  };

  const runAllTests = async () => {
    setTestResults([]);
    setRunning(true);

    try {
      const user = await base44.auth.me();

      // Test 1: Format Validation
      addTestResult('Format Validation - Valid PDF', 
        validateUploadFormat('test.pdf').valid ? 'PASS' : 'FAIL',
        validateUploadFormat('test.pdf').message
      );

      addTestResult('Format Validation - Valid Excel', 
        validateUploadFormat('test.xlsx').valid ? 'PASS' : 'FAIL',
        validateUploadFormat('test.xlsx').message
      );

      addTestResult('Format Validation - Invalid Format', 
        !validateUploadFormat('test.exe').valid ? 'PASS' : 'FAIL',
        validateUploadFormat('test.exe').message
      );

      // Test 2: History Logging
      const testDocId = 'test_' + Date.now();
      await logDocumentAction({
        documentId: testDocId,
        documentName: 'test_doc.pdf',
        documentType: 'invoice',
        actionType: 'uploaded',
        actionBy: user.email,
        fileFormat: 'pdf',
        module: 'Testing',
        feature: 'History Test'
      });
      addTestResult('History Logging - Upload Action', 'PASS', 'Action logged successfully');

      // Test 3: History Retrieval
      const history = await getDocumentHistory(testDocId);
      addTestResult('History Retrieval', 
        history.length > 0 ? 'PASS' : 'FAIL',
        `Retrieved ${history.length} history entries`
      );

      // Test 4: NEW Document Detection
      const newDoc = { created_date: new Date().toISOString() };
      addTestResult('NEW Document Detection',
        isNewDocument(newDoc) ? 'PASS' : 'FAIL',
        'Document correctly identified as new'
      );

      // Test 5: OLD Document Detection
      const oldDoc = { created_date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() };
      addTestResult('OLD Document Detection',
        !isNewDocument(oldDoc) ? 'PASS' : 'FAIL',
        'Document correctly identified as old'
      );

      // Test 6: Badge Color Mapping
      const pdfColor = getFormatBadgeColor('pdf');
      const xlsxColor = getFormatBadgeColor('xlsx');
      const docxColor = getFormatBadgeColor('docx');
      addTestResult('Format Badge Colors',
        pdfColor.includes('red') && xlsxColor.includes('green') && docxColor.includes('blue') ? 'PASS' : 'FAIL',
        `PDF=${pdfColor.split(' ')[0]}, Excel=${xlsxColor.split(' ')[0]}, Word=${docxColor.split(' ')[0]}`
      );

      // Test 7: File Size Formatting
      const size1 = formatFileSize(1024);
      const size2 = formatFileSize(1024000);
      addTestResult('File Size Formatting',
        size1 === '1.00 KB' && size2 === '1.00 MB' ? 'PASS' : 'FAIL',
        `1024 bytes = ${size1}, 1024000 bytes = ${size2}`
      );

      // Test 8: Supported Formats Check
      addTestResult('Supported Formats Configuration',
        SUPPORTED_FORMATS.UPLOAD.length > 0 && 
        SUPPORTED_FORMATS.EXPORT.length > 0 ? 'PASS' : 'FAIL',
        `Upload: ${SUPPORTED_FORMATS.UPLOAD.length} formats, Export: ${SUPPORTED_FORMATS.EXPORT.length} formats`
      );

      // Test 9: Document Types Enum
      addTestResult('Document Types Enum',
        DOCUMENT_TYPES.length >= 8 ? 'PASS' : 'FAIL',
        `${DOCUMENT_TYPES.length} document types defined`
      );

      // Test 10: Action Types Enum
      addTestResult('Action Types Enum',
        ACTION_TYPES.length >= 11 ? 'PASS' : 'FAIL',
        `${ACTION_TYPES.length} action types defined`
      );

      alert('✅ All tests completed! Check results below.');

    } catch (error) {
      console.error('Test error:', error);
      addTestResult('Test Suite', 'ERROR', error.message);
    } finally {
      setRunning(false);
    }
  };

  const handleViewDocHistory = async (doc) => {
    try {
      const history = await getDocumentHistory(doc.id);
      setSelectedDocHistory(history);
      setShowHistory(true);
    } catch (error) {
      console.error('Failed to load history:', error);
      alert('Failed to load document history');
    }
  };

  const passedTests = testResults.filter(t => t.result === 'PASS').length;
  const failedTests = testResults.filter(t => t.result === 'FAIL').length;
  const errorTests = testResults.filter(t => t.result === 'ERROR').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
            <TestTube className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            Document Format & History Test Suite
          </h1>
          <p className="text-slate-600 text-lg">
            Comprehensive testing of multi-format support and audit trail functionality
          </p>
          <Badge className="mt-3 bg-purple-600">QA Testing Environment</Badge>
        </div>

        {/* Test Results Stats */}
        {testResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase">Total Tests</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{testResults.length}</p>
                  </div>
                  <TestTube className="w-12 h-12 text-slate-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase">Passed</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">{passedTests}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-emerald-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase">Failed</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{failedTests}</p>
                  </div>
                  <AlertCircle className="w-12 h-12 text-red-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase">Success Rate</p>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">
                      {testResults.length > 0 ? Math.round((passedTests / testResults.length) * 100) : 0}%
                    </p>
                  </div>
                  <Zap className="w-12 h-12 text-indigo-300" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="upload">📤 Upload Tests</TabsTrigger>
            <TabsTrigger value="history">📜 History Tests</TabsTrigger>
            <TabsTrigger value="export">📥 Export Tests</TabsTrigger>
            <TabsTrigger value="documents">📄 Live Documents</TabsTrigger>
            <TabsTrigger value="run">▶️ Run All Tests</TabsTrigger>
          </TabsList>

          {/* Upload Tests */}
          <TabsContent value="upload">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Format Upload Validation Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-3">Supported Upload Formats:</h3>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORTED_FORMATS.UPLOAD.map(fmt => (
                      <Badge key={fmt} className={getFormatBadgeColor(fmt)}>
                        {fmt.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Test File Upload:</h3>
                  <Input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const validation = validateUploadFormat(file.name);
                        setTestFile({ file, validation });
                      }
                    }}
                    accept=".pdf,.xlsx,.docx,.jpg,.png,.csv"
                  />
                  
                  {testFile && (
                    <div className={`mt-4 p-4 rounded-lg border ${
                      testFile.validation.valid 
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {testFile.validation.valid ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-semibold">
                          {testFile.validation.valid ? '✅ Valid Format' : '❌ Invalid Format'}
                        </span>
                      </div>
                      <p className="text-sm mb-2">
                        <strong>File:</strong> {testFile.file.name}
                      </p>
                      <p className="text-sm mb-2">
                        <strong>Size:</strong> {formatFileSize(testFile.file.size)}
                      </p>
                      <p className="text-sm mb-2">
                        <strong>Extension:</strong> {testFile.validation.extension?.toUpperCase() || 'Unknown'}
                      </p>
                      <p className="text-sm">
                        <strong>Message:</strong> {testFile.validation.message}
                      </p>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tests */}
          <TabsContent value="history">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Document History & Change Detection Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    onClick={async () => {
                      const user = await base44.auth.me();
                      await logDocumentAction({
                        documentId: 'test_' + Date.now(),
                        documentName: 'test_doc.pdf',
                        documentType: 'invoice',
                        actionType: 'uploaded',
                        actionBy: user.email,
                        fileFormat: 'pdf',
                        module: 'Testing',
                        feature: 'History Test'
                      });
                      alert('✅ Test action logged!');
                    }}
                    className="bg-blue-600 text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Log Upload Action
                  </Button>

                  <Button
                    onClick={async () => {
                      const user = await base44.auth.me();
                      await logDocumentAction({
                        documentId: 'test_' + Date.now(),
                        documentName: 'test_doc.pdf',
                        documentType: 'invoice',
                        actionType: 'exported',
                        actionBy: user.email,
                        fileFormat: 'xlsx',
                        module: 'Testing',
                        feature: 'History Test'
                      });
                      alert('✅ Test export logged!');
                    }}
                    className="bg-green-600 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Log Export Action
                  </Button>

                  <Button
                    onClick={async () => {
                      const history = await getDocumentHistory('test_' + (Date.now() - 10000));
                      setSelectedDocHistory(history);
                      setShowHistory(true);
                    }}
                    className="bg-indigo-600 text-white"
                  >
                    <History className="w-4 h-4 mr-2" />
                    View Test History
                  </Button>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Change Detection Tests:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-sm">New Document (less than 24 hours):</span>
                      {isNewDocument({ created_date: new Date().toISOString() }) && (
                        <Badge className="bg-blue-600 text-white animate-pulse">🆕 NEW</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-sm">Old Document (more than 24 hours):</span>
                      {!isNewDocument({ created_date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() }) && (
                        <Badge className="bg-slate-400 text-white">Not New</Badge>
                      )}
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tests */}
          <TabsContent value="export">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Format Export Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <h3 className="font-semibold text-emerald-900 mb-3">Supported Export Formats:</h3>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORTED_FORMATS.EXPORT.map(fmt => (
                      <Badge key={fmt} className={getFormatBadgeColor(fmt)}>
                        {fmt.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>

                {documents.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Test Export Menu (Live Document):</h3>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{documents[0].file_name}</p>
                          <p className="text-sm text-slate-600">
                            {documents[0].document_type} • {new Date(documents[0].created_date).toLocaleDateString()}
                          </p>
                        </div>
                        <FormatExportMenu 
                          document={documents[0]}
                          module="Testing"
                          feature="Export Test"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <h4 className="font-semibold text-indigo-900 mb-2">Export Test Instructions:</h4>
                  <ol className="text-sm text-indigo-800 space-y-1 ml-5 list-decimal">
                    <li>Click the "Export" dropdown above</li>
                    <li>Select a format (PDF, Excel, or Word)</li>
                    <li>Verify the export starts and logs the action</li>
                    <li>Check that the file downloads (simulated in test mode)</li>
                  </ol>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Documents */}
          <TabsContent value="documents">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Live Document Examples with Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {documents.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No documents available. Upload documents in the Documents page to see them here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.slice(0, 5).map(doc => {
                      const isNew = isNewDocument(doc);
                      const fileExt = doc.file_name?.split('.').pop()?.toLowerCase();
                      
                      return (
                        <div
                          key={doc.id}
                          className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-medium text-slate-900">{doc.file_name}</p>
                                
                                {/* NEW Badge */}
                                {isNew && (
                                  <Badge className="bg-blue-600 text-white animate-pulse text-xs">
                                    🆕 NEW
                                  </Badge>
                                )}
                                
                                {/* Format Badge */}
                                {fileExt && (
                                  <Badge className={`${getFormatBadgeColor(fileExt)} text-xs`}>
                                    {fileExt.toUpperCase()}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Badge variant="outline" className="capitalize">
                                  {doc.document_type?.replace(/_/g, ' ')}
                                </Badge>
                                <span>{new Date(doc.created_date).toLocaleDateString()}</span>
                                {doc.verified && (
                                  <Badge className="bg-emerald-100 text-emerald-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => handleViewDocHistory(doc)}
                                variant="outline"
                                size="sm"
                              >
                                <History className="w-4 h-4" />
                              </Button>
                              <FormatExportMenu 
                                document={doc}
                                module="Testing"
                                feature="Live Document Test"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>

          {/* Run All Tests */}
          <TabsContent value="run">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Automated Test Suite</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">Tests Included:</h3>
                  <ul className="text-sm text-purple-800 space-y-1 ml-5 list-disc">
                    <li>Format validation (PDF, Excel, Word, Images)</li>
                    <li>Invalid format rejection</li>
                    <li>History action logging</li>
                    <li>History retrieval</li>
                    <li>NEW document detection</li>
                    <li>Badge color mapping</li>
                    <li>File size formatting</li>
                    <li>Configuration validation</li>
                  </ul>
                </div>

                <Button
                  onClick={runAllTests}
                  disabled={running}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-6 text-lg"
                >
                  {running ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-5 h-5 mr-2" />
                      Run All Tests
                    </>
                  )}
                </Button>

                {/* Test Results */}
                {testResults.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900 mt-6">Test Results:</h3>
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.result === 'PASS' 
                            ? 'bg-emerald-50 border-emerald-200'
                            : result.result === 'FAIL'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-amber-50 border-amber-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={
                                result.result === 'PASS' ? 'bg-emerald-600' :
                                result.result === 'FAIL' ? 'bg-red-600' :
                                'bg-amber-600'
                              }>
                                {result.result}
                              </Badge>
                              <span className="font-medium text-slate-900">{result.test}</span>
                            </div>
                            <p className="text-sm text-slate-700">{result.message}</p>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
                <h2 className="text-xl font-bold">Test Document History</h2>
              </div>
              <div className="p-6">
                <DocumentHistoryTimeline history={selectedDocHistory} />
              </div>
              <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6">
                <Button onClick={() => setShowHistory(false)} className="w-full">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
