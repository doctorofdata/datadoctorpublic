import React, { useState, useEffect } from 'react';
import {
    Container,
    Stack,
    Typography,
    Box,
    Paper,
    Grid,
    List,
    ListItem,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    useTheme,
    Card,
    CardContent
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CodeIcon from '@mui/icons-material/Code';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import SecurityIcon from '@mui/icons-material/Security';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloudIcon from '@mui/icons-material/Cloud';
import MemoryIcon from '@mui/icons-material/Memory';
import DashboardFrame from 'components/DashboardFrame';

// Keyframes for subtle animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const countUp = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components
const MainContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
  minHeight: '100vh',
  padding: 0,
  maxWidth: 'none !important',
  position: 'relative',
}));

const HeroImageSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '50vh',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("https://interestingengineering.com/_next/image?url=https%3A%2F%2Fimages.interestingengineering.com%2F2023%2F12%2F17%2Fimage%2Fjpeg%2FvuPe0eeWZY8i7TszVtG2RMMRLw14TK95viZVkOkX.jpg&w=1200&q=75")',
    backgroundSize: '100% auto', // Stretch width to 100%, height auto-scales
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: 'brightness(0.8) contrast(1.2)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80px',
    background: 'linear-gradient(to bottom, transparent, #0a0a0a)',
  }
}));

const HeroContentSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  background: '#0a0a0a',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(5, 2),
  zIndex: 2,
}));

const MainTitle = styled(Typography)(({ theme }) => ({
  color: '#ffffff',
  fontWeight: 200,
  letterSpacing: '4px',
  marginBottom: theme.spacing(1),
  textAlign: 'center',
}));

const SubtitleText = styled(Typography)(({ theme }) => ({
  color: '#b0b0b0',
  fontWeight: 300,
  letterSpacing: '1px',
  marginBottom: theme.spacing(3),
  textAlign: 'center',
}));

const SkillsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
  marginBottom: theme.spacing(3),
}));

const ContentSection = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
  border: '1px solid #333',
  borderRadius: '12px',
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease',
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: '#ffffff',
  fontWeight: 600,
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  borderBottom: '2px solid #333',
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
  border: '1px solid #404040',
  borderRadius: '8px',
  margin: theme.spacing(1, 0),
  boxShadow: 'none',
  '&:before': {
    display: 'none',
  },
  '&:hover': {
    boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
  }
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: 'rgba(0,0,0,0.3)',
  minHeight: '64px',
  '& .MuiAccordionSummary-content': {
    alignItems: 'center',
    gap: theme.spacing(2),
  }
}));

const CompanyLogo = styled('img')({
  width: '48px',
  height: '48px',
  borderRadius: '8px',
  border: '2px solid #333',
  filter: 'brightness(0.9) contrast(1.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    filter: 'brightness(1) contrast(1.2)',
  }
});

const JobTitle = styled(Typography)(({ theme }) => ({
  color: '#ffffff',
  fontWeight: 600,
  fontSize: '1.1rem',
}));

const JobDate = styled(Typography)(({ theme }) => ({
  color: '#888',
  fontSize: '0.9rem',
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(45deg, #333, #444)',
  color: '#ffffff',
  border: '1px solid #555',
  fontWeight: 500,
  '&:hover': {
    background: 'linear-gradient(45deg, #444, #555)',
    transform: 'scale(1.05)',
  },
  transition: 'all 0.3s ease',
}));

const EducationItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  borderBottom: '1px solid #333',
  '&:last-child': {
    borderBottom: 'none',
    marginBottom: 0,
    paddingBottom: 0,
  }
}));

const TechStackSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  background: 'rgba(0,0,0,0.3)',
  borderRadius: '8px',
  border: '1px solid #333',
}));

// New Educational Stats Section Components
const EducationalSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6, 0),
  background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23333" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.3,
  }
}));

const TechniqueFeaturedCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
  border: '1px solid #444',
  borderRadius: '16px',
  height: '100%',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  animation: `${fadeInUp} 0.8s ease-out`,
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
    borderColor: '#666',
    '& .technique-icon': {
      animation: `${pulse} 1.5s infinite`,
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #666, #aaa, #666)',
  }
}));

const TechniqueIcon = styled(Box)(({ theme }) => ({
  width: '60px',
  height: '60px',
  borderRadius: '12px',
  background: 'linear-gradient(45deg, #333, #555)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  border: '2px solid #444',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-2px',
    borderRadius: '14px',
    background: 'linear-gradient(45deg, #666, #333, #666)',
    zIndex: -1,
  }
}));

const TechniqueTitle = styled(Typography)(({ theme }) => ({
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '1.1rem',
  marginBottom: theme.spacing(1),
}));

const TechniqueDescription = styled(Typography)(({ theme }) => ({
  color: '#b0b0b0',
  fontSize: '0.9rem',
  lineHeight: 1.5,
  marginBottom: theme.spacing(2),
}));

const TechniqueApplications = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
}));

const ApplicationChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.7rem',
  height: '24px',
  backgroundColor: 'rgba(255,255,255,0.1)',
  color: '#ccc',
  border: '1px solid rgba(255,255,255,0.2)',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.2)',
  }
}));

const ProjectCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
  border: '1px solid #333',
  borderRadius: '12px',
  margin: theme.spacing(1, 0),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
    borderColor: '#444',
  }
}));

const ProjectIcon = styled(Box)(({ theme }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '8px',
  background: 'linear-gradient(45deg, #333, #444)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
}));

const TimelineSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: '20px',
    top: 0,
    bottom: 0,
    width: '2px',
    background: 'linear-gradient(to bottom, #333, #666, #333)',
  }
}));

const TimelineItem = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingLeft: theme.spacing(6),
  paddingBottom: theme.spacing(3),
  '&::before': {
    content: '""',
    position: 'absolute',
    left: '14px',
    top: '8px',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, #666, #aaa)',
    border: '3px solid #1a1a1a',
    zIndex: 1,
  }
}));

const Page = () => {
  const [expandedPanel, setExpandedPanel] = useState(false);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const skills = ['Python', 'AWS', 'Machine Learning', 'Neo4j', 'NLP', 'LLM', 'API Development', 'Data Science'];

  const skillsByCategory = [
    {
        category: 'Languages & Databases',
        icon: <CodeIcon sx={{ color: '#fff' }} />,
        skills: ['Python', 'SQL', 'Neo4j', 'JavaScript']
    },
    {
        category: 'AI & Machine Learning',
        icon: <SmartToyIcon sx={{ color: '#fff' }} />,
        skills: ['Deep Learning', 'NLP/LLM', 'Scikit-learn', 'TensorFlow', 'PyTorch']
    },
    {
        category: 'Cloud & DevOps',
        icon: <CloudIcon sx={{ color: '#fff' }} />,
        skills: ['AWS', 'Docker', 'CI/CD', 'MLOps', 'Terraform']
    },
    {
        category: 'Data Science & Analytics',
        icon: <DataUsageIcon sx={{ color: '#fff' }} />,
        skills: ['Pandas', 'NumPy', 'Jupyter', 'ETL', 'Data Warehousing']
    }
  ];


  // Educational Data Science Techniques
  const dataScienceTechniques = [
    {
      title: 'Graph Neural Networks',
      description: 'Advanced deep learning for graph-structured data, enabling complex relationship modeling in Neo4j databases.',
      icon: <AccountTreeIcon sx={{ color: '#fff', fontSize: '2rem' }} />,
      applications: ['Neo4j', 'Fraud Detection', 'Knowledge Graphs']
    },
    {
      title: 'Large Language Models',
      description: 'Transformer-based architectures for natural language understanding and generation in enterprise applications.',
      icon: <SmartToyIcon sx={{ color: '#fff', fontSize: '2rem' }} />,
      applications: ['NLP', 'Text Classification', 'Query Generation']
    },
    {
      title: 'ML Pipeline Orchestration',
      description: 'End-to-end machine learning workflows with automated training, validation, and deployment on cloud platforms.',
      icon: <CloudIcon sx={{ color: '#fff', fontSize: '2rem' }} />,
      applications: ['AWS', 'MLOps', 'Automated ML']
    },
    {
      title: 'Deep Learning Architectures',
      description: 'Convolutional and recurrent neural networks for complex pattern recognition and sequence modeling.',
      icon: <MemoryIcon sx={{ color: '#fff', fontSize: '2rem' }} />,
      applications: ['Computer Vision', 'Time Series', 'Feature Learning']
    }
  ];

  const keyProjects = [
    {
      title: 'LLM Neo4j Query Engine',
      description: 'Natural language to graph database queries',
      icon: <DataUsageIcon sx={{ color: '#fff' }} />,
      tech: ['Python', 'Neo4j', 'LLM']
    },
    {
      title: 'Business Artifact Classifier',
      description: 'NLP pipeline with 600+ taxonomy outcomes',
      icon: <CodeIcon sx={{ color: '#fff' }} />,
      tech: ['NLP', 'Python', 'Classification']
    },
    {
      title: 'Fraud Detection Pipeline',
      description: 'Real-time fraud detection for delivery services',
      icon: <SecurityIcon sx={{ color: '#fff' }} />,
      tech: ['AWS', 'Machine Learning', 'Pipeline']
    }
  ];

  const careerTimeline = [
    { year: '2025', event: 'A.I. Bootcamp - NYC Data Science Academy', type: 'education' },
    { year: '2024', event: 'Senior Data Scientist - Citibank', type: 'work' },
    { year: '2022', event: 'Senior Data Scientist - FedEx', type: 'work' },
    { year: '2019', event: 'Data Scientist - IBM', type: 'work' },
    { year: '2018', event: 'M.Sc. Data Science - UT Dallas', type: 'education' }
  ];

  return (
    
    <MainContainer>
      {/* Hero Image Section */}
      <HeroImageSection />
      
      {/* Hero Content Section */}
      <HeroContentSection>
        <MainTitle variant="h1">
          ZAN SADIQ
        </MainTitle>
        <SubtitleText variant="h4">
          Data Scientist & AI Engineer
        </SubtitleText>
        
        <SkillsContainer>
          {skills.map((skill, index) => (
            <SkillChip 
              key={skill} 
              label={skill} 
              icon={<StarIcon />}
            />
          ))}
        </SkillsContainer>

        <TechStackSection>
          <Typography variant="body2" sx={{ color: '#888', mb: 2, textAlign: 'center' }}>
            Technology Stack
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <img 
              src="https://go-skill-icons.vercel.app/api/icons?i=anaconda,api,apple,aws,bash,chatgpt,gcp,github,python&titles=true" 
              alt="Technology Stack"
              style={{ 
                maxWidth: '100%', 
                height: 'auto', 
                filter: 'brightness(0.8) contrast(1.2)',
                borderRadius: '8px'
              }}
            />
          </Box>
        </TechStackSection>
      </HeroContentSection>

      {/* Educational Data Science Techniques Section */}
      <EducationalSection>
        <Container>
          <Typography 
            variant="h3" 
            sx={{ 
              color: '#ffffff', 
              textAlign: 'center', 
              mb: 2,
              fontWeight: 300,
              letterSpacing: '2px'
            }}
          >
            Core Methodologies
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#888', 
              textAlign: 'center', 
              mb: 5,
              maxWidth: '600px',
              margin: '0 auto 40px auto'
            }}
          >
            Advanced machine learning and AI techniques powering enterprise-scale solutions
          </Typography>
          
          <Grid container spacing={4}>
            {dataScienceTechniques.map((technique, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <TechniqueFeaturedCard>
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <TechniqueIcon className="technique-icon">
                      {technique.icon}
                    </TechniqueIcon>
                    <TechniqueTitle>
                      {technique.title}
                    </TechniqueTitle>
                    <TechniqueDescription sx={{ flexGrow: 1 }}>
                      {technique.description}
                    </TechniqueDescription>
                    <TechniqueApplications>
                      {technique.applications.map((app, appIndex) => (
                        <ApplicationChip
                          key={appIndex}
                          label={app}
                          size="small"
                        />
                      ))}
                    </TechniqueApplications>
                  </CardContent>
                </TechniqueFeaturedCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </EducationalSection>

      {/* Content Grid */}
      <Container sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4}>
          {/* Skills Section */}
          <Grid item xs={12} md={6}>
            <ContentSection elevation={0}>
              <SectionTitle variant="h5">
                <StarIcon sx={{ color: '#ffffff' }} />
                Technical Skills
              </SectionTitle>
              
                {skillsByCategory.map((category, index) => (
                    <StyledAccordion key={index} defaultExpanded>
                        <StyledAccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#ffffff' }} />}>
                            {category.icon}
                            <Typography sx={{ ml: 1.5, fontWeight: '500', color: '#fff' }}>{category.category}</Typography>
                        </StyledAccordionSummary>
                        <AccordionDetails sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, backgroundColor: 'rgba(0,0,0,0.5)', borderTop: '1px solid #333', padding: 2 }}>
                            {category.skills.map((skill, i) => (
                                <SkillChip key={i} label={skill} />
                            ))}
                        </AccordionDetails>
                    </StyledAccordion>
                ))}
            </ContentSection>
          </Grid>

          {/* Experience Section */}
          <Grid item xs={12} md={6}>
            <ContentSection elevation={0}>
              <SectionTitle variant="h5">
                <WorkIcon sx={{ color: '#ffffff' }} />
                Experience
              </SectionTitle>

              <StyledAccordion 
                expanded={expandedPanel === 'citi'} 
                onChange={handleAccordionChange('citi')}
              >
                <StyledAccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#ffffff' }} />}>
                  <CompanyLogo 
                    src="https://1000logos.net/wp-content/uploads/2016/11/Citibank-logo.jpg" 
                    alt="Citibank"
                  />
                  <Box>
                    <JobTitle>Senior Data Scientist</JobTitle>
                    <JobDate>November 2022 - May 2024</JobDate>
                  </Box>
                </StyledAccordionSummary>
                <AccordionDetails sx={{ backgroundColor: 'rgba(0,0,0,0.5)', borderTop: '1px solid #333' }}>
                  <Typography variant="body2" sx={{ color: '#ccc', lineHeight: 1.6 }}>
                    • Developed an LLM application for natural language querying of Neo4j databases<br/>
                    • Built an NLP pipeline for classifying business artifact with 600+ taxonomic outcomes<br/>
                    • Created a semantic similarity engine for search query matching
                  </Typography>
                </AccordionDetails>
              </StyledAccordion>

              <StyledAccordion 
                expanded={expandedPanel === 'fedex'} 
                onChange={handleAccordionChange('fedex')}
              >
                <StyledAccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#ffffff' }} />}>
                  <CompanyLogo 
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQACepP6q4rvLK966nBCun2zXWrCV6w1u_Vw&s" 
                    alt="FedEx"
                  />
                  <Box>
                    <JobTitle>Senior Data Scientist</JobTitle>
                    <JobDate>January 2022 - November 2024</JobDate>
                  </Box>
                </StyledAccordionSummary>
                <AccordionDetails sx={{ backgroundColor: 'rgba(0,0,0,0.5)', borderTop: '1px solid #333' }}>
                  <Typography variant="body2" sx={{ color: '#ccc', lineHeight: 1.6 }}>
                    • Led Cybersecurity & Risk Analytics initiatives for external threat detection<br/>
                    • Built a fraud detection pipeline for the FedEx Delivery Manager application<br/>
                    • Enhanced enterprise security capabilities through advanced analytics
                  </Typography>
                </AccordionDetails>
              </StyledAccordion>

              <StyledAccordion 
                expanded={expandedPanel === 'ibm'} 
                onChange={handleAccordionChange('ibm')}
              >
                <StyledAccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#ffffff' }} />}>
                  <CompanyLogo 
                    src="https://interbrand.com/wp-content/uploads/2020/10/ibm-square.png" 
                    alt="IBM"
                  />
                  <Box>
                    <JobTitle>Data Scientist</JobTitle>
                    <JobDate>November 2019 - June 2021</JobDate>
                  </Box>
                </StyledAccordionSummary>
                <AccordionDetails sx={{ backgroundColor: 'rgba(0,0,0,0.5)', borderTop: '1px solid #333' }}>
                  <Typography variant="body2" sx={{ color: '#ccc', lineHeight: 1.6 }}>
                    • Doubled the performance of a fraud detection model in the automobile insurance industry<br/>
                    • Created a production forecasting system for seasonal sales trends<br/>
                    • Contributed to the CloudPak Acceleration Team for hybrid cloud data science initiatives
                  </Typography>
                </AccordionDetails>
              </StyledAccordion>
            </ContentSection>
          </Grid>
        </Grid>

        {/* Key Projects Section */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" sx={{ color: '#ffffff', mb: 3, textAlign: 'center' }}>
            Key Projects
          </Typography>
          <Grid container spacing={3}>
            {keyProjects.map((project, index) => (
              <Grid item xs={12} md={4} key={index}>
                <ProjectCard>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <ProjectIcon>
                        {project.icon}
                      </ProjectIcon>
                      <Box>
                        <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                          {project.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#b0b0b0', mt: 1 }}>
                          {project.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {project.tech.map((tech) => (
                        <Chip
                          key={tech}
                          label={tech}
                          size="small"
                          sx={{
                            backgroundColor: '#333',
                            color: '#ccc',
                            fontSize: '0.7rem',
                            height: '24px'
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </ProjectCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Career Timeline */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" sx={{ color: '#ffffff', mb: 4, textAlign: 'center' }}>
            Career Timeline
          </Typography>
          <Grid container>
            <Grid item xs={12} md={8} sx={{ margin: '0 auto' }}>
              <TimelineSection>
                {careerTimeline.map((item, index) => (
                  <TimelineItem key={index}>
                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                      {item.year}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#b0b0b0' }}>
                      {item.event}
                    </Typography>
                    <Chip
                      size="small"
                      label={item.type}
                      sx={{
                        mt: 1,
                        backgroundColor: item.type === 'education' ? '#2a4d3a' : '#4a2d2a',
                        color: item.type === 'education' ? '#8fbc8f' : '#daa520',
                        fontSize: '0.7rem'
                      }}
                    />
                  </TimelineItem>
                ))}
              </TimelineSection>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </MainContainer>
  );
};

const HomePage = () => {
  return (
    <DashboardFrame
      header={'The Data Dojo'}
      page={<Page />}
    />
  );
};

export default HomePage;
