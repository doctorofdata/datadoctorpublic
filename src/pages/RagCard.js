import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function RagCard() {
  return (
    <Card sx={{ maxWidth: 400 }}>
      <CardMedia
        sx={{ height: 200 }}
        image="/rag.png"
        title="rag"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Retrieval-Augmented Generation (RAG)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          A process for optimizing the output of a large language model.
          It functions by allowing the model to reference an authoritative knowledge base outside of its original training data sources before generating a response.
          RAG extends the already powerful capabilities of LLMs to specific domains or an organization's internal knowledge base, all without the need to retrain the model.
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small"><a href = 'https://github.com/doctorofdata/current/blob/main/llmraglatest.ipynb'>Learn More</a></Button>
      </CardActions>
    </Card>
  );
}

