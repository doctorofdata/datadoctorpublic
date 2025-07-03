import { Amplify } from 'aws-amplify';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import {
    BrowserRouter,
    Route,
    Routes
} from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider } from 'Context';
import RagView from './pages/RagView';
import Text2CypherView from './pages/Text2Cypher';
import HomePage from './pages/Home';
import Blog from './pages/Blog';

const config = {
    API: {
        endpoints: [
            {
                name: "theDataDojo",
                endpoint: "http://127.0.0.1:5000"
            }
        ]
    }
};

Amplify.configure(config);

let theme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#1A1B29',
            light: '#dad2b8'
        },
        primary: {
            dark: '#b0bf8d',
            main: '#2F52E0',
            light: '#2F52E0',
            contrastText: '#000000DE',
            _states: {
                selected: '#A0ABF1'
            },
            amber: '#FFCA28'
        },
        common: {
            black: '#000000',
            white: '#dad188'
        },
        chat: {
            background: '#0D34BD',
            message: '#E6E6FF',
            messageText: '#2F52E0'
        },
    }
});

theme = responsiveFontSizes(theme);

function App() {
    return (
        <ThemeProvider theme = {theme}>
            <div className = "App">
                <AppProvider>
                    <BrowserRouter>
                        <CssBaseline />
                        <Routes>
                            <Route path = '/' element = {<HomePage />} />
                            <Route path = '/finetunedmodel' element = {<Text2CypherView />} />
                            <Route path = '/nytimesmodel' element = {<RagView />} />
                            <Route path = '/blog' element = {<Blog />} />
                        </Routes>
                    </BrowserRouter>
                </AppProvider>
            </div>
        </ThemeProvider>
    );
}

export default App;
