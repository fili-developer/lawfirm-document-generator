import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://your-api-gateway-url.com/prod';

const DocumentGenerator = () => {
  const [documentType, setDocumentType] = useState('');
  const [parameters, setParameters] = useState({});
  const [userQuery, setUserQuery] = useState('');
  const [generatedDocument, setGeneratedDocument] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [citations, setCitations] = useState([]);

  const documentTypes = [
    { value: 'contract', label: 'Contract' },
    { value: 'memo', label: 'Legal Memorandum' },
    { value: 'letter', label: 'Legal Letter' }
  ];

  const handleParameterChange = (key, value) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const generateDocument = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/generate-document`, {
        documentType,
        parameters,
        userQuery
      });
      
      setGeneratedDocument(response.data.generatedDocument);
      setCitations(response.data.citations || []);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while generating the document');
    } finally {
      setLoading(false);
    }
  };

  const renderParameterFields = () => {
    switch (documentType) {
      case 'contract':
        return (
          <>
            <TextField
              fullWidth
              label="Contract Type"
              value={parameters.contractType || ''}
              onChange={(e) => handleParameterChange('contractType', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Party 1"
              value={parameters.party1 || ''}
              onChange={(e) => handleParameterChange('party1', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Party 2"
              value={parameters.party2 || ''}
              onChange={(e) => handleParameterChange('party2', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Jurisdiction"
              value={parameters.jurisdiction || ''}
              onChange={(e) => handleParameterChange('jurisdiction', e.target.value)}
              margin="normal"
            />
          </>
        );
      case 'memo':
        return (
          <>
            <TextField
              fullWidth
              label="Client"
              value={parameters.client || ''}
              onChange={(e) => handleParameterChange('client', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Matter"
              value={parameters.matter || ''}
              onChange={(e) => handleParameterChange('matter', e.target.value)}
              margin="normal"
            />
          </>
        );
      case 'letter':
        return (
          <>
            <TextField
              fullWidth
              label="From"
              value={parameters.fromParty || ''}
              onChange={(e) => handleParameterChange('fromParty', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="To"
              value={parameters.toParty || ''}
              onChange={(e) => handleParameterChange('toParty', e.target.value)}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Tone</InputLabel>
              <Select
                value={parameters.tone || ''}
                onChange={(e) => handleParameterChange('tone', e.target.value)}
              >
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="formal">Formal</MenuItem>
                <MenuItem value="friendly">Friendly</MenuItem>
              </Select>
            </FormControl>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Document Generator
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Document Type</InputLabel>
              <Select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                {documentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {documentType && renderParameterFields()}

            <TextField
              fullWidth
              label="Detailed Requirements"
              multiline
              rows={4}
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              margin="normal"
              placeholder="Describe the specific requirements for your document..."
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={generateDocument}
                disabled={!documentType || !userQuery || loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Generating...' : 'Generate Document'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, minHeight: 600 }}>
            <Typography variant="h5" gutterBottom>
              Generated Document
            </Typography>
            
            {generatedDocument ? (
              <>
                <Box sx={{ 
                  border: 1, 
                  borderColor: 'grey.300', 
                  p: 2, 
                  borderRadius: 1, 
                  backgroundColor: 'grey.50',
                  minHeight: 400,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap'
                }}>
                  {generatedDocument}
                </Box>
                
                {citations.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Source Citations:
                    </Typography>
                    {citations.map((citation, index) => (
                      <Typography key={index} variant="body2" color="text.secondary">
                        {index + 1}. {citation.retrievedReferences?.[0]?.location?.s3Location?.uri}
                      </Typography>
                    ))}
                  </Box>
                )}
                
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" sx={{ mr: 1 }}>
                    Download as PDF
                  </Button>
                  <Button variant="outlined" sx={{ mr: 1 }}>
                    Copy to Clipboard
                  </Button>
                  <Button variant="outlined">
                    Save to History
                  </Button>
                </Box>
              </>
            ) : (
              <Typography color="text.secondary">
                Generated document will appear here...
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DocumentGenerator;