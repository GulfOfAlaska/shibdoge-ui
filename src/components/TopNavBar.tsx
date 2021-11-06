import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { ConnectSample } from './ConnectSample';
import ShibaDoge from '../assets/shiba-doge.png'
import { Grid } from '@mui/material';

const backgroundStyle = {
  background: 'transparent',
  boxShadow: 'none'
};

const logoStyle = {
  background: `url(${ShibaDoge}) no-repeat`,
  backgroundSize: '100% 100%',
  height: '2.5vw',
  width: '2.5vw',
  marginRight: '1vw'
}

export default function TopNavBar() {
  return (
    <Box>
      <Box style={backgroundStyle}>
        <Grid
          justifyContent="space-between"
          alignItems="center"
          container
        >
          <div style={logoStyle} />
          <ConnectSample />
        </Grid>
      </Box>
    </Box >
  );
}