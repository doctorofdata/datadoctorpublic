import React, { useState } from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Chip
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Psychology as PsychologyIcon,
    Storage as StorageIcon,
    Code as CodeIcon
} from '@mui/icons-material';

const AccordionCard = () => {
    const [expanded, setExpanded] = useState('overview');

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <Card sx={{ width: '100%', borderRadius: 2 }}>
            <CardMedia
                component="img"
                height="auto"
                image='https://dist.neo4j.com/wp-content/uploads/20220318151113/03.22_MetaImg_CypherQuery_BM.jpg'
                alt="Text2Cypher"
                sx={{ width: '100%', objectFit: 'contain' }}
            />
            
            <CardContent sx={{ p: 0 }}>
                {/* Overview Section */}
                <Accordion 
                    expanded={expanded === 'overview'} 
                    onChange={handleChange('overview')}
                    sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ px: 2, py: 1 }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PsychologyIcon color="primary" />
                            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                                Fine-Tuning w/ Llama3.1
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 2, pb: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                            Here, we have fine-tuned Llama3.1 utilizing the Unsloth library in python and a dataset published by Neo4j, 
                            so that it may perform better on coding exercises utilizing the Cypher query language.
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label="Llama3.1" size="small" color="primary" variant="outlined" />
                            <Chip label="Fine-Tuned" size="small" color="success" variant="outlined" />
                            <Chip label="Neo4j Dataset" size="small" color="info" variant="outlined" />
                        </Box>
                    </AccordionDetails>
                </Accordion>

                {/* Neo4j Details Section */}
                <Accordion 
                    expanded={expanded === 'neo4j'} 
                    onChange={handleChange('neo4j')}
                    sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ px: 2, py: 1 }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StorageIcon color="secondary" />
                            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                                About Neo4j
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 2, pb: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                            Neo4j is a graph database management system. The data elements stored in Neo4j 
                            are comprised of nodes and the edges connecting them to each other, along with 
                            their associated properties. It is implemented in Java and made accessible 
                            through the Cypher query language.
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label="Graph Database" size="small" color="secondary" variant="outlined" />
                            <Chip label="Java" size="small" color="warning" variant="outlined" />
                            <Chip label="Nodes & Edges" size="small" color="info" variant="outlined" />
                        </Box>
                    </AccordionDetails>
                </Accordion>

                {/* Cypher Language Section */}
                <Accordion 
                    expanded={expanded === 'cypher'} 
                    onChange={handleChange('cypher')}
                    sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ px: 2, py: 1 }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CodeIcon color="success" />
                            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                                Cypher Query Language
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 2, pb: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 2 }}>
                            Cypher is Neo4j's declarative query language for graph databases. It allows for 
                            expressive and efficient querying of graph data using pattern matching.
                        </Typography>
                       
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label="Declarative" size="small" color="success" variant="outlined" />
                            <Chip label="Pattern Matching" size="small" color="primary" variant="outlined" />
                            <Chip label="Graph Queries" size="small" color="info" variant="outlined" />
                        </Box>
                    </AccordionDetails>
                </Accordion>
            </CardContent>
        </Card>
    );
};

export default AccordionCard;

/*
import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';

export default function FineTuningExpansion() {
  return (
    <Card >
           <CardMedia
              component = "img"
              height = "auto" // Image scales proportionally
              image = 'https://dist.neo4j.com/wp-content/uploads/20220318151113/03.22_MetaImg_CypherQuery_BM.jpg'
              alt = "Text2Cypher"
              sx = {{ width: '100%', objectFit: 'contain' }}/>  
      <CardContent>
        <Typography gutterBottom variant = "h5" component = "div">
          Fine-Tuning w/ Llama3.1
        </Typography>
        <Typography variant="body2" sx = {{ color: 'text.secondary' }}>
             Neo4j is a graph database management system.
             The data elements stored in Neo4 are comprised of nodes and the edges connecting them to each other, along with their associated properties.
             It is implemented in Java and made accessible through the Cypher query language.
             Here, we have fine-tuned LlAma3.1 using a dataset published by Neo4j, so that it may perform better on coding exercises utilizing the Cypher query language.
        </Typography>
      </CardContent>
    </Card>
  );
}
*/
