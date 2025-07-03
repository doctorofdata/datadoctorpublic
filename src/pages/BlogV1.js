import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Divider,
  useTheme,
  Chip
} from '@mui/material';
import DashboardFrame from 'components/DashboardFrame';
import IframeComponent from './IframeComponent';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const blogPosts = [
  {
    title: 'Evaluating Retrieval Techniques for Semantic Similarity in Retrieval Augmented Generation',
    date: 'July 2, 2025',
    iframeUrl: 'https://nbsanity.com/static/f32aae91a3af0f110587e6c4d53cf235/wayfair_wands_search_comprehensive.html',
    tags: ['Cosine Similarity', 'Semantic ReRanking'],
    teaser: 'Scoring the results of different semantic retrieval techniques using the Wayfair WANDS furniture dataset.',
    featured: false
  },
  {
    title: 'Retrieval Augmented Generation with Google Gemini and the New York Times',
    date: 'July 1st, 2025',
    iframeUrl: 'https://nbsanity.com/static/905163e9e3082c44f0c9d0c5d5c1a071/llmraglatest.html',
    tags: ['Gemini', 'NYTimes', 'RAG'],
    teaser: 'Using Retrieval Augmented Generation to synthesize news data with Google Gemini. Learn how we built a custom pipeline around real-world journalism.',
    featured: true,
  },
  {
    title: 'Fine-Tuning Llama 3.1 with Unsloth to Translate Natural Language to Cypher Syntax',
    date: 'June 25th, 2025',
    iframeUrl: 'https://nbsanity.com/static/a7938217d3de52b7c41501996373df87/latest_unsloth_llama3_1_finetuning_full.html',
    tags: ['Llama3.1', 'Neo4j', 'Unsloth'],
    teaser: 'This post shows how to create a natural-language-to-Cypher translator using Llama 3.1 and Unsloth’s blazing-fast fine-tuning tools.',
    featured: false,
  },
];

const BlogPost = ({ title, date, iframeUrl, tags }) => {
  return (
    <Box
      component="section"
      sx={{
        borderBottom: '1px solid #222',
        py: 6,
      }}
    >
      <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {tags.map((tag, idx) => (
          <Chip
            key={idx}
            label={`#${tag}`}
            size="small"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.7rem',
              backgroundColor: '#1a1a1a',
              color: '#aaa',
              borderRadius: '4px',
              border: '1px solid #333',
            }}
          />
        ))}
      </Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          fontSize: '1.4rem',
          mb: 0.5,
          color: '#eee',
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: '#666', fontFamily: 'monospace', textTransform: 'uppercase' }}
      >
        {new Date(date).toDateString()}
      </Typography>
      <Box
        sx={{
          mt: 3,
          border: '1px solid #333',
          borderRadius: '6px',
          overflow: 'hidden',
          height: '480px',
        }}
      >
        <IframeComponent src={iframeUrl} />
      </Box>
    </Box>
  );
};

const Page = () => {
  return (
    <Box sx={{ backgroundColor: '#0b0b0b', minHeight: '100vh', color: '#ccc' }}>
      <Container maxWidth="md">
        <Box sx={{ pt: 8, pb: 2 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: '2.2rem',
              color: '#fff',
              mb: 1,
              lineHeight: 1.3,
            }}
          >
            Build Logs from the Edge of AI
          </Typography>
          <Typography variant="body1" sx={{ color: '#888' }}>
            A collection of dev notes, fine-tuning breakdowns, and real-world AI experiments.
          </Typography>
        </Box>

        {blogPosts.map((post) => (
          <BlogPost key={post.id} {...post} />
        ))}
      </Container>
    </Box>
  );
};

const Blog = () => {
  return <DashboardFrame header="Blog" page={<Page />} />;
};

export default Blog;