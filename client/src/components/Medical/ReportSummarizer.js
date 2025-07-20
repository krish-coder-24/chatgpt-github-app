import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Grid,
  Paper,
  TextField,
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  UploadFileRounded,
  DescriptionRounded,
  SummarizeRounded,
  DownloadRounded,
  WarningRounded,
  CheckCircleRounded,
  InfoRounded,
  LocalHospitalRounded
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { jsPDF } from 'jspdf';

const ReportSummarizer = ({ onReportAnalyzed }) => {
  const [reportText, setReportText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState('');
  const [showFullReport, setShowFullReport] = useState(false);
  
  const fileInputRef = useRef();

  // Sample medical report for demo
  const sampleReport = `
MEDICAL CONSULTATION REPORT

Patient: John Doe
Date: ${new Date().toLocaleDateString()}
Provider: Dr. Smith, MD

CHIEF COMPLAINT:
Patient presents with chest pain and shortness of breath lasting 3 days.

HISTORY OF PRESENT ILLNESS:
67-year-old male with a history of hypertension and diabetes mellitus type 2 reports onset of central chest pain 3 days ago. Pain is described as pressure-like, 7/10 intensity, radiating to left arm. Associated with shortness of breath and diaphoresis. No relief with rest.

PHYSICAL EXAMINATION:
- Vital Signs: BP 150/95, HR 92, RR 22, Temp 98.6°F, O2 Sat 94%
- Cardiovascular: Regular rhythm, S3 gallop present, no murmurs
- Pulmonary: Bilateral rales in lower lobes
- Extremities: Bilateral pedal edema

DIAGNOSTIC RESULTS:
- ECG: ST depression in leads V2-V6
- Chest X-ray: Cardiomegaly, pulmonary congestion
- BNP: 1250 pg/mL (elevated)
- Troponin I: 0.8 ng/mL (elevated)

ASSESSMENT AND PLAN:
1. Acute heart failure with reduced ejection fraction
   - Start ACE inhibitor
   - Diuretic therapy
   - Beta-blocker when stable
2. Rule out acute coronary syndrome
   - Cardiology consultation
   - Consider cardiac catheterization
3. Diabetes management
   - Continue metformin
   - Monitor glucose closely

FOLLOW-UP:
Return in 48 hours or sooner if symptoms worsen.
`;

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setReportText(text);
    };

    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      setError('Please upload a text file (.txt)');
    }
  };

  // Load sample report
  const loadSampleReport = () => {
    setReportText(sampleReport);
    setUploadedFile(null);
    setError('');
  };

  // Analyze report using AI
  const analyzeReport = async () => {
    if (!reportText.trim()) {
      setError('Please provide a medical report to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      // Simulate AI analysis (in production, call your AI API)
      await new Promise(resolve => setTimeout(resolve, 3000));

      const analysisResult = {
        summary: generateSummary(reportText),
        keyFindings: extractKeyFindings(reportText),
        recommendations: generateRecommendations(reportText),
        severity: assessSeverity(reportText),
        followUp: extractFollowUp(reportText),
        medications: extractMedications(reportText),
        diagnostics: extractDiagnostics(reportText)
      };

      setAnalysis(analysisResult);
      
      if (onReportAnalyzed) {
        onReportAnalyzed(analysisResult);
      }

    } catch (err) {
      setError('Failed to analyze report. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate AI summary (simplified for demo)
  const generateSummary = (text) => {
    return `**Executive Summary:** This medical report describes a 67-year-old male patient presenting with acute heart failure and possible acute coronary syndrome. The patient has significant cardiovascular risk factors including hypertension and diabetes. Clinical findings suggest decompensated heart failure with elevated cardiac biomarkers requiring immediate intervention and cardiology consultation.

**Key Concerns:** The combination of chest pain, elevated troponin, and heart failure symptoms requires urgent cardiac evaluation to rule out ongoing myocardial ischemia.`;
  };

  // Extract key findings
  const extractKeyFindings = (text) => {
    return [
      { type: 'critical', text: 'Elevated troponin indicating cardiac injury' },
      { type: 'critical', text: 'ECG changes (ST depression) suggesting ischemia' },
      { type: 'warning', text: 'Signs of heart failure (S3 gallop, pedal edema)' },
      { type: 'warning', text: 'Elevated BNP confirming heart failure' },
      { type: 'info', text: 'Hypertension and diabetes as risk factors' }
    ];
  };

  // Generate recommendations
  const generateRecommendations = (text) => {
    return [
      'Immediate cardiology consultation for cardiac catheterization evaluation',
      'Initiate heart failure medications (ACE inhibitor, diuretics)',
      'Continuous cardiac monitoring',
      'Serial troponin and ECG monitoring',
      'Strict fluid balance monitoring',
      'Consider echocardiogram to assess ejection fraction'
    ];
  };

  // Assess severity
  const assessSeverity = (text) => {
    return {
      level: 'high',
      score: 8.5,
      description: 'High priority case requiring immediate medical attention'
    };
  };

  // Extract follow-up instructions
  const extractFollowUp = (text) => {
    return 'Return in 48 hours or immediately if symptoms worsen. Cardiology follow-up within 1 week.';
  };

  // Extract medications
  const extractMedications = (text) => {
    return [
      { name: 'ACE Inhibitor', purpose: 'Heart failure management' },
      { name: 'Diuretic', purpose: 'Fluid management' },
      { name: 'Beta-blocker', purpose: 'Heart rate control (when stable)' },
      { name: 'Metformin', purpose: 'Diabetes management' }
    ];
  };

  // Extract diagnostic tests
  const extractDiagnostics = (text) => {
    return [
      { test: 'ECG', result: 'ST depression V2-V6', significance: 'Suggests ischemia' },
      { test: 'Chest X-ray', result: 'Cardiomegaly, congestion', significance: 'Heart failure' },
      { test: 'BNP', result: '1250 pg/mL', significance: 'Elevated - confirms heart failure' },
      { test: 'Troponin I', result: '0.8 ng/mL', significance: 'Elevated - cardiac injury' }
    ];
  };

  // Export analysis as PDF
  const exportToPDF = () => {
    if (!analysis) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = margin;

    // Title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('VitalAI Medical Report Analysis', margin, yPosition);
    yPosition += 20;

    // Summary
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Summary:', margin, yPosition);
    yPosition += 10;

    doc.setFont(undefined, 'normal');
    const summaryLines = doc.splitTextToSize(analysis.summary, pageWidth - 2 * margin);
    summaryLines.forEach(line => {
      doc.text(line, margin, yPosition);
      yPosition += 7;
    });

    // Key Findings
    yPosition += 10;
    doc.setFont(undefined, 'bold');
    doc.text('Key Findings:', margin, yPosition);
    yPosition += 10;

    analysis.keyFindings.forEach(finding => {
      doc.setFont(undefined, 'normal');
      doc.text(`• ${finding.text}`, margin + 5, yPosition);
      yPosition += 7;
    });

    // Recommendations
    yPosition += 10;
    doc.setFont(undefined, 'bold');
    doc.text('Recommendations:', margin, yPosition);
    yPosition += 10;

    analysis.recommendations.forEach(rec => {
      doc.setFont(undefined, 'normal');
      doc.text(`• ${rec}`, margin + 5, yPosition);
      yPosition += 7;
    });

    doc.save('vitalai-report-analysis.pdf');
  };

  const getSeverityColor = (level) => {
    switch (level) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const getFindingIcon = (type) => {
    switch (type) {
      case 'critical': return <WarningRounded sx={{ color: '#f44336' }} />;
      case 'warning': return <InfoRounded sx={{ color: '#ff9800' }} />;
      case 'info': return <CheckCircleRounded sx={{ color: '#4caf50' }} />;
      default: return <InfoRounded />;
    }
  };

  return (
    <Card sx={{ maxWidth: 1000, mx: 'auto', mt: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <SummarizeRounded sx={{ mr: 1, color: '#1976d2' }} />
          <Typography variant="h6" component="h2">
            Medical Report Summarizer
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Input Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upload or Input Report
              </Typography>

              <Box sx={{ mb: 2 }}>
                <input
                  type="file"
                  accept=".txt"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outlined"
                  startIcon={<UploadFileRounded />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ mr: 1, mb: 1 }}
                >
                  Upload File
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DescriptionRounded />}
                  onClick={loadSampleReport}
                  sx={{ mb: 1 }}
                >
                  Load Sample
                </Button>
              </Box>

              {uploadedFile && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Uploaded: {uploadedFile.name}
                </Alert>
              )}

              <TextField
                multiline
                rows={12}
                fullWidth
                placeholder="Paste medical report text here or upload a file..."
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                fullWidth
                startIcon={isAnalyzing ? null : <SummarizeRounded />}
                onClick={analyzeReport}
                disabled={isAnalyzing || !reportText.trim()}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0, #0d47a1)',
                  }
                }}
              >
                {isAnalyzing ? (
                  <>
                    <LinearProgress sx={{ width: '100%', mr: 2 }} />
                    Analyzing Report...
                  </>
                ) : (
                  'Analyze Report'
                )}
              </Button>
            </Paper>
          </Grid>

          {/* Analysis Results */}
          <Grid item xs={12} md={6}>
            {analysis ? (
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Analysis Results
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<DownloadRounded />}
                    onClick={exportToPDF}
                    variant="outlined"
                  >
                    Export PDF
                  </Button>
                </Box>

                {/* Severity Assessment */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Priority Level
                  </Typography>
                  <Chip
                    label={`${analysis.severity.level.toUpperCase()} PRIORITY (${analysis.severity.score}/10)`}
                    sx={{
                      backgroundColor: getSeverityColor(analysis.severity.level),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {analysis.severity.description}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Summary */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Executive Summary
                  </Typography>
                  <Box 
                    sx={{ 
                      bgcolor: 'grey.50', 
                      p: 2, 
                      borderRadius: 1,
                      maxHeight: 150,
                      overflow: 'auto'
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {analysis.summary}
                    </ReactMarkdown>
                  </Box>
                </Box>

                {/* Key Findings */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Key Findings
                  </Typography>
                  <List dense>
                    {analysis.keyFindings.slice(0, 3).map((finding, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {getFindingIcon(finding.type)}
                        </ListItemIcon>
                        <ListItemText 
                          primary={finding.text}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  {analysis.keyFindings.length > 3 && (
                    <Button
                      size="small"
                      onClick={() => setShowFullReport(true)}
                      sx={{ mt: 1 }}
                    >
                      View Full Analysis
                    </Button>
                  )}
                </Box>

                {/* Quick Actions */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Immediate Actions
                  </Typography>
                  <List dense>
                    {analysis.recommendations.slice(0, 2).map((rec, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <LocalHospitalRounded sx={{ color: '#1976d2' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={rec}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Paper>
            ) : (
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                <Box>
                  <SummarizeRounded sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Ready to Analyze
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload or paste a medical report to get started with AI-powered analysis
                  </Typography>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* Full Report Dialog */}
        <Dialog
          open={showFullReport}
          onClose={() => setShowFullReport(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Complete Analysis Report</DialogTitle>
          <DialogContent>
            {analysis && (
              <Box>
                {/* Full Summary */}
                <Typography variant="h6" gutterBottom>
                  Summary
                </Typography>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {analysis.summary}
                </ReactMarkdown>

                {/* All Key Findings */}
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  All Key Findings
                </Typography>
                <List>
                  {analysis.keyFindings.map((finding, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {getFindingIcon(finding.type)}
                      </ListItemIcon>
                      <ListItemText primary={finding.text} />
                    </ListItem>
                  ))}
                </List>

                {/* Recommendations */}
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Recommendations
                </Typography>
                <List>
                  {analysis.recommendations.map((rec, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <LocalHospitalRounded sx={{ color: '#1976d2' }} />
                      </ListItemIcon>
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>

                {/* Diagnostics */}
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Diagnostic Results
                </Typography>
                <Grid container spacing={2}>
                  {analysis.diagnostics.map((diagnostic, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Paper elevation={1} sx={{ p: 2 }}>
                        <Typography variant="subtitle2">{diagnostic.test}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {diagnostic.result}
                        </Typography>
                        <Typography variant="caption" color="primary">
                          {diagnostic.significance}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={exportToPDF} startIcon={<DownloadRounded />}>
              Export PDF
            </Button>
            <Button onClick={() => setShowFullReport(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ReportSummarizer;