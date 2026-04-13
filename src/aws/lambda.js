 const { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } = require("@aws-sdk/client-bedrock-agent-runtime");

   const client = new BedrockAgentRuntimeClient({ region: "us-east-1" });

   exports.handler = async (event) => {
       try {
           const { documentType, parameters, userQuery } = JSON.parse(event.body);
           
           const knowledgeBaseId = process.env.KNOWLEDGE_BASE_ID;
           const prompt = constructPrompt(documentType, parameters, userQuery);
           
           const command = new RetrieveAndGenerateCommand({
               input: {
                   text: prompt
               },
               retrieveAndGenerateConfiguration: {
                   type: "KNOWLEDGE_BASE",
                   knowledgeBaseConfiguration: {
                       knowledgeBaseId: knowledgeBaseId,
                       modelArn: "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0",
                       generationConfiguration: {
                           promptTemplate: {
                               textPromptTemplate: `
                                   You are a legal document expert. Use the provided context to generate a professional legal document.
                                   
                                   Context: $search_results$
                                   
                                   User Request: $query$
                                   
                                   Generate a complete, professional legal document following standard legal formatting and language conventions.
                               `
                           }
                       },
                       retrievalConfiguration: {
                           vectorSearchConfiguration: {
                               numberOfResults: 10
                           }
                       }
                   }
               }
           });
           
           const response = await client.send(command);
           
           return {
               statusCode: 200,
               headers: {
                   "Content-Type": "application/json",
                   "Access-Control-Allow-Origin": "*"
               },
               body: JSON.stringify({
                   generatedDocument: response.output.text,
                   citations: response.citations || []
               })
           };
           
       } catch (error) {
           console.error('Error:', error);
           return {
               statusCode: 500,
               headers: {
                   "Content-Type": "application/json",
                   "Access-Control-Allow-Origin": "*"
               },
               body: JSON.stringify({ error: error.message })
           };
       }
   };

   function constructPrompt(documentType, parameters, userQuery) {
       const basePrompts = {
           contract: `Generate a ${parameters.contractType} contract between ${parameters.party1} and ${parameters.party2}. Terms: ${parameters.terms || 'standard terms'}. Jurisdiction: ${parameters.jurisdiction || 'New York'}. Additional: ${userQuery}`,
           memo: `Generate a legal memorandum regarding: ${userQuery}. Client: ${parameters.client || 'N/A'}. Matter: ${parameters.matter || 'N/A'}.`,
           letter: `Generate a ${parameters.letterType || 'business'} letter from ${parameters.fromParty} to ${parameters.toParty}. Purpose: ${userQuery}.`
       };
       return basePrompts[documentType] || userQuery;
   }