import { Button, TextField, Container, Box  } from "@mui/material";
import React, { useState } from "react";
function TourSearchForm({ onSearch, onInputChange }) {
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        onInputChange(e.target.value);
    }

    const handleSearchClick = () => {
        onSearch(inputValue);
    }

    return (
        <Container>
            <Box display="flex" alignItems="center" justifyContent="space-between" marginY={3}>
                <TextField 
                    label="Search Tours by ID" 
                    variant="outlined" 
                    fullWidth 
                    style={{ marginRight: '20px' }}
                    value={inputValue}
                    onChange={handleInputChange} 
                />
                <Button variant="contained" color="primary" onClick={handleSearchClick}>
                    Search
                </Button>
            </Box>
        </Container>
    );
}

export default TourSearchForm;


