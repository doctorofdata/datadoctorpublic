import React from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
} from '@mui/material';
import DashboardFrame from 'components/DashboardFrame';
import IframeComponent from './IframeComponent';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const blogPosts = [
  {
    title: 'Evaluating Retrieval Techniques for Semantic Similarity in Retrieval Augmented Generation',
    date: 'July 2nd, 2025',
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
    teaser: "This post shows how to create a natural-language-to-Cypher translator using Llama 3.1 and Unsloth's blazing-fast fine-tuning tools.",
    featured: false,
  },
];

const BlogPost = ({ title, date, iframeUrl, tags, teaser, featured }) => {
  return (
    <Box
      component="article"
      sx={{
        mb: 4,
        p: 3,
        border: '1px solid #333',
        borderRadius: '8px',
        backgroundColor: featured ? '#0f1419' : '#0d1117',
        borderLeft: featured ? '4px solid #00ff88' : '1px solid #333',
        position: 'relative',
        '&:hover': {
          borderColor: '#555',
          backgroundColor: '#161b22',
          transition: 'all 0.2s ease-in-out',
        }
      }}
    >
      {/* Terminal-style header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        borderBottom: '1px solid #21262d',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', gap: 0.5, mr: 2 }}>
          <Box sx={{ 
            width: 12, 
            height: 12, 
            borderRadius: '50%', 
            backgroundColor: '#ff5f57' 
          }} />
          <Box sx={{ 
            width: 12, 
            height: 12, 
            borderRadius: '50%', 
            backgroundColor: '#ffbd2e' 
          }} />
          <Box sx={{ 
            width: 12, 
            height: 12, 
            borderRadius: '50%', 
            backgroundColor: '#28ca42' 
          }} />
        </Box>
        <Typography
          sx={{
            fontFamily: 'Monaco, "Lucida Console", monospace',
            fontSize: '0.75rem',
            color: '#7d8590',
            letterSpacing: '0.5px'
          }}
        >
          ~/blog/{title.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '')}.md
        </Typography>
      </Box>

      {/* Metadata section */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 2,
        flexWrap: 'wrap'
      }}>
        <Typography
          sx={{
            fontFamily: 'Monaco, "Lucida Console", monospace',
            fontSize: '0.7rem',
            color: '#7d8590',
            backgroundColor: '#21262d',
            px: 1.5,
            py: 0.5,
            borderRadius: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          {new Date(date.replace(/(\d+)(st|nd|rd|th)/, '$1')).toLocaleDateString(undefined, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})}
        </Typography>
        {featured && (
          <Typography
            sx={{
              fontFamily: 'Monaco, "Lucida Console", monospace',
              fontSize: '0.7rem',
              color: '#00ff88',
              backgroundColor: 'rgba(0, 255, 136, 0.1)',
              px: 1.5,
              py: 0.5,
              borderRadius: '12px',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            ★ FEATURED
          </Typography>
        )}
      </Box>

      {/* Tags */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {tags.map((tag, idx) => (
          <Typography
            key={idx}
            sx={{
              fontFamily: 'Monaco, "Lucida Console", monospace',
              fontSize: '0.65rem',
              color: '#58a6ff',
              backgroundColor: 'rgba(88, 166, 255, 0.1)',
              px: 1,
              py: 0.3,
              borderRadius: '4px',
              border: '1px solid rgba(88, 166, 255, 0.2)',
              letterSpacing: '0.5px',
              '&:before': {
                content: '"#"',
                color: '#7d8590'
              }
            }}
          >
            {tag.toLowerCase().replace(/\s+/g, '_')}
          </Typography>
        ))}
      </Box>

      {/* Title */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          fontSize: '1.3rem',
          mb: 1.5,
          color: '#e6edf3',
          fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
          lineHeight: 1.4,
          '&:before': {
            content: '"// "',
            color: '#7d8590',
            fontSize: '0.9em'
          }
        }}
      >
        {title}
      </Typography>

      {/* Teaser */}
      <Typography
        sx={{
          color: '#8b949e',
          fontSize: '0.9rem',
          mb: 3,
          fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
          lineHeight: 1.5,
          fontStyle: 'italic',
          '&:before': {
            content: '"/* "',
            color: '#7d8590'
          },
          '&:after': {
            content: '" */"',
            color: '#7d8590'
          }
        }}
      >
        {teaser}
      </Typography>

      {/* Code block style iframe container */}
      <Box
        sx={{
          border: '1px solid #30363d',
          borderRadius: '6px',
          overflow: 'hidden',
          height: '480px',
          backgroundColor: '#0d1117',
          position: 'relative',
          '&:before': {
            content: '"```javascript"',
            position: 'absolute',
            top: 8,
            left: 12,
            fontSize: '0.7rem',
            color: '#7d8590',
            fontFamily: 'Monaco, "Lucida Console", monospace',
            zIndex: 1,
            backgroundColor: '#0d1117',
            px: 1
          }
        }}
      >
        <Box sx={{ pt: 2 }}>
          <IframeComponent src={iframeUrl} />
        </Box>
      </Box>
    </Box>
  );
};

const Page = () => {
  return (
    <Box sx={{ 
      backgroundColor: '#010409', 
      minHeight: '100vh', 
      color: '#e6edf3',
      backgroundImage: `
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 135, 135, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 215, 120, 0.05) 0%, transparent 50%)
      `
    }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 8, lg: 12, xl: 16 } }}>
        {/* Terminal-style header */}
        <Box sx={{ pt: 6, pb: 4 }}>
          <Box sx={{
            border: '1px solid #30363d',
            borderRadius: '8px',
            backgroundColor: '#0d1117',
            p: 3,
            mb: 4
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 0.5, mr: 2 }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  backgroundColor: '#ff5f57' 
                }} />
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  backgroundColor: '#ffbd2e' 
                }} />
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  backgroundColor: '#28ca42' 
                }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: 'Monaco, "Lucida Console", monospace',
                  fontSize: '0.8rem',
                  color: '#7d8590'
                }}
              >
                user@localhost:~/dev/blog$
              </Typography>
            </Box>
            
            <Typography
              sx={{
                fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
                fontSize: '0.9rem',
                color: '#7d8590',
                mb: 1
              }}
            >
              <Box component="span" sx={{ color: '#ff7b72' }}>cat</Box> README.md
            </Typography>
            
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                fontSize: '2rem',
                color: '#e6edf3',
                mb: 1,
                lineHeight: 1.3,
                fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
                '&:before': {
                  content: '"# "',
                  color: '#7d8590'
                }
              }}
            >
              Build Logs from the Edge of AI
            </Typography>
            
            <Typography 
              sx={{ 
                color: '#8b949e',
                fontFamily: 'Monaco, "Lucida Console", monospace',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                '&:before': {
                  content: '"> "',
                  color: '#7d8590'
                }
              }}
            >
              A collection of dev notes, fine-tuning breakdowns, and real-world AI experiments.
              <br />
              <Box component="span" sx={{ color: '#7d8590' }}>> </Box>
              Last updated: {new Date().toISOString().split('T')[0]}
            </Typography>
          </Box>
        </Box>

        {/* Blog posts */}
        <Box sx={{ pb: 6 }}>
          {blogPosts.map((post, index) => (
            <BlogPost key={index} {...post} />
          ))}
        </Box>
      </Container>
    </Box>
  );
};

const Blog = () => {
  return <DashboardFrame header="Blog" page={<Page />} />;
};

export default Blog;