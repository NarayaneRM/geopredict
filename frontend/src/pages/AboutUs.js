import React from 'react';
import { Typography, Container, Grid, Paper, Box, Divider, List, ListItem, ListItemText, ListItemIcon, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import DataObjectIcon from '@mui/icons-material/DataObject';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import StorageIcon from '@mui/icons-material/Storage';
import CodeIcon from '@mui/icons-material/Code';
import SchoolIcon from '@mui/icons-material/School';
import LaunchIcon from '@mui/icons-material/Launch';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'left',
  color: theme.palette.text.primary,
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const SectionTitle = ({ children, icon }) => (
  <Box display="flex" alignItems="center" mb={2}>
    {icon}
    <Typography variant="h4" component="h2" ml={2}>
      {children}
    </Typography>
  </Box>
);

const AboutUs = () => {
  return (
    <Box sx={{ 
      flexGrow: 1, 
      overflow: 'auto',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Typography variant="h2" gutterBottom align="center" sx={{ color: 'text.primary', mb: 4 }}>
          About GeoPredict
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <StyledPaper>
              <SectionTitle icon={<DataObjectIcon sx={{ fontSize: 40, color: 'primary.main' }} />}>
                Project Overview
              </SectionTitle>
              <Typography variant="body1" paragraph>
                GeoPredict is an interactive platform developed to predict greenhouse gas (GHG) emissions, 
                using machine learning models applied to geospatial data. The platform aims to promote digital inclusion, 
                facilitating community access to emission data and its analysis.
              </Typography>
            </StyledPaper>
          </Grid>
          
          <Grid item xs={12}>
            <StyledPaper>
              <SectionTitle icon={<StorageIcon sx={{ fontSize: 40, color: 'secondary.main' }} />}>
                Databases Used
              </SectionTitle>
              <Typography variant="body1" paragraph>
                GeoPredict leverages several geospatial and emissions-related databases:
              </Typography>
              <List>
                {[
                  { 
                    name: "US GHG Center: ODIAC", 
                    description: "CO2 emissions from human activities (2001-2022)",
                    link: "https://dljsq618eotzp.cloudfront.net/browseui/browseui/#odiac-ffco2-monthgrid-v2023/"
                  },
                  { 
                    name: "US GHG Center: MICASA", 
                    description: "Natural emissions data (2001-2022)",
                    link: "https://dljsq618eotzp.cloudfront.net/browseui/browseui/#micasa-carbonflux-monthgrid-v1/"
                  },
                  { 
                    name: "US GHG Center: EMIT", 
                    description: "Significant emission events data (2022)",
                    link: "https://dljsq618eotzp.cloudfront.net/browseui/browseui/browseui/#emit-ch4plume-v1/"
                  },
                  { 
                    name: "SEEG", 
                    description: "Brazilian GHG emissions data (1998-2022)",
                    link: "https://plataforma.seeg.eco.br/"
                  },
                  { 
                    name: "INPE", 
                    description: "Real-time wildfire data in Brazil",
                    link: "https://terrabrasilis.dpi.inpe.br/queimadas/bdqueimadas/"
                  }
                ].map((db, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <StorageIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <>
                          {db.name}
                          {db.link && (
                            <Link href={db.link} target="_blank" rel="noopener noreferrer" sx={{ ml: 1 }}>
                              <LaunchIcon fontSize="small" />
                            </Link>
                          )}
                        </>
                      } 
                      secondary={db.description} 
                    />
                  </ListItem>
                ))}
              </List>
            </StyledPaper>
          </Grid>
          
          <Grid item xs={12}>
            <StyledPaper>
              <SectionTitle icon={<BarChartIcon sx={{ fontSize: 40, color: 'success.main' }} />}>
                Features and Models
              </SectionTitle>
              <List>
                {[
                  "Emissions and Wildfire Data visualization",
                  "Interactive Timeline with 3D globe",
                  "Predictive Model using CNN and LSTM",
                  "Educational Visualization with city analogy"
                ].map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <BarChartIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
            </StyledPaper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <StyledPaper>
              <SectionTitle icon={<CodeIcon sx={{ fontSize: 40, color: 'info.main' }} />}>
                Technologies
              </SectionTitle>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6">Backend</Typography>
                  <List dense>
                    {["Python", "Flask", "NumPy", "SciPy", "TensorFlow", "Scikit-learn"].map((tech, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CodeIcon color="info" />
                        </ListItemIcon>
                        <ListItemText primary={tech} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6">Frontend</Typography>
                  <List dense>
                    {["React", "React Router", "D3.js", "Three.js", "Material-UI", "React Spring"].map((tech, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CodeIcon color="info" />
                        </ListItemIcon>
                        <ListItemText primary={tech} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </StyledPaper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <StyledPaper>
              <SectionTitle icon={<GroupIcon sx={{ fontSize: 40, color: 'warning.main' }} />}>
                Our Team
              </SectionTitle>
              <List>
                {[
                  { name: "Narayane Ribeiro Medeiros", role: "Lead Developer", github: "NarayaneRM" },
                  { name: "Francisco Eduardo Fontenele Ramos Neto", role: "Data Scientist", github: "fontflows" },
                  { name: "Juan Marco de Jesus Libonatti", role: "UI/UX Designer", github: "WarXenozord" }
                ].map((member, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <GitHubIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={member.name} 
                      secondary={
                        <React.Fragment>
                          {member.role} - 
                          <a href={`https://github.com/${member.github}`} target="_blank" rel="noopener noreferrer">
                            GitHub
                          </a>
                        </React.Fragment>
                      } 
                    />
                  </ListItem>
                ))}
              </List>
            </StyledPaper>
          </Grid>
          
          <Grid item xs={12}>
            <StyledPaper>
              <SectionTitle icon={<SchoolIcon sx={{ fontSize: 40, color: 'error.main' }} />}>
                Acknowledgments
              </SectionTitle>
              <Typography variant="body1" paragraph>
                We thank the Technological Institute of Aeronautics (ITA - Brazil) for the support and resources provided.
              </Typography>
              <Typography variant="body1">
                Our recognition to the open-source community for the tools and libraries used in this project.
              </Typography>
            </StyledPaper>
          </Grid>
        </Grid>
        
        <Box mt={4}>
          <Divider sx={{ bgcolor: 'text.secondary' }} />
          <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
            © 2023 GeoPredict. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutUs;