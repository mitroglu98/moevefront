import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";

function Header() {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                    Moeve Shipping Studio
                </Typography>
                <Box>
                    <Button color="inherit" component={Link} to="/">
                        Tours
                    </Button>
                    <Button color="inherit" component={Link} to="/drivers">
                        Drivers
                    </Button>
                    <Button color="inherit" component={Link} to="/contracts">
                        Contracts
                    </Button>
                    <Button color="inherit" component={Link} to="/create-tour">
                       Create tour
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Header;
