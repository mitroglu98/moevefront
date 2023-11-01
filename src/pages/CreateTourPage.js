import React, { useState, useEffect } from "react";
import { fetchData } from "../utils/apiHelper";
import { Box, Button, TextField, Typography, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText } from "@mui/material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Autocomplete from '@mui/material/Autocomplete';

function CreateTourPage() {
    const [drivers, setDrivers] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState('');
    const [selectedContracts, setSelectedContracts] = useState([]);
    const [tourDate, setTourDate] = useState(new Date());
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchDriversAndContracts = async () => {
            try {
                const fetchedDrivers = await fetchData("http://localhost:8080/api/drivers");
                const fetchedContracts = await fetchData("http://localhost:8080/api/contracts");

                setDrivers(fetchedDrivers);
                setContracts(fetchedContracts);
            } catch (error) {
                console.log("There was a problem fetching data:", error.message);
            }
        };

        fetchDriversAndContracts();
    }, []);

    const handleCreateTour = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/tours", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    driverId: selectedDriver,
                    contractIds: selectedContracts,
                    tourDate: tourDate.toISOString().split('T')[0]
                })
            });
            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Something went wrong with the server.");
                } else {
                    throw new Error(await response.text());
                }
            }
        
    
            setMessage("Tour created successfully!");
        } catch (error) {
            setMessage(error.message);
        }
    };
    
    
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', p: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
                label="Tour Date"
                value={tourDate}
                onChange={(newDate) => setTourDate(newDate)}
                renderInput={(params) => <TextField {...params} sx={{ width: 300 }} />}
            />
        </LocalizationProvider>

        <Typography variant="h6">Pick Driver:</Typography>
        <Autocomplete
            value={drivers.find(driver => driver.id === selectedDriver)}
            onChange={(event, newValue) => setSelectedDriver(newValue ? newValue.id : '')}
            options={drivers}
            getOptionLabel={(option) => `${option.name} ${option.surname}`}
            renderInput={(params) => <TextField {...params} label="Select Driver" sx={{ width: 300 }} />}
        />

        <Typography variant="h6">Pick Contracts:</Typography>
        <Autocomplete
            multiple
            value={contracts.filter(contract => selectedContracts.includes(contract.id))}
            onChange={(event, newValues) => setSelectedContracts(newValues.map(value => value.id))}
            options={contracts}
            getOptionLabel={(option) => `${option.contractNumber} - ${option.customerName}`}
            renderInput={(params) => <TextField {...params} label="Select Contracts" sx={{ width: 300 }} />}
        />

        <Button onClick={handleCreateTour}>Create Tour</Button>
        <Dialog
    open={!!message}
    onClose={() => setMessage(null)}
>
    <DialogTitle>INFO</DialogTitle>
    <DialogContent>
        <DialogContentText>
            {message}
        </DialogContentText>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setMessage(null)} color="primary">
            OK
        </Button>
    </DialogActions>
</Dialog>
    </Box>
);
}

export default CreateTourPage;
