import React, { useState, useEffect } from "react";
import { fetchData } from "../utils/apiHelper"; 
import { Box, TextField, Button, List, ListItem,Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText  } from "@mui/material";
import { debounce } from 'lodash';
function DriverInfo() {
    const [drivers, setDrivers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newDriver, setNewDriver] = useState({ name: "", surname: "" });
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const debouncedFetch = debounce(() => fetchDrivers(), 300);
        debouncedFetch();
    
        return () => debouncedFetch.cancel();
    }, [searchTerm]);

    const fetchDrivers = async () => {
        const endpoint = searchTerm
            ? `http://localhost:8080/api/drivers/search?name=${searchTerm}`
            : "http://localhost:8080/api/drivers";
        
        try {
            const data = await fetchData(endpoint);
            setDrivers(data);
        } catch (error) {
            console.log("There was a problem fetching drivers:", error.message);
        }
    };

    const handleAddDriver = async () => {
        if (!newDriver.name || !newDriver.surname) {
            setMessage("Both name and surname must be provided!");
            return; 
        }
        try {
            const addedDriver = await fetchData(`http://localhost:8080/api/drivers`, 'POST', newDriver);
            setDrivers(prevDrivers => [...prevDrivers, addedDriver]);
            setMessage("Driver successfully added!");
        } catch (error) {
            setMessage("Error adding driver: " + error.message);
        }
    };
    
    const handleDeleteDriver = async (driverId) => {
        try {
            await fetchData(`http://localhost:8080/api/drivers/${driverId}`, 'DELETE');
            setDrivers(prevDrivers => prevDrivers.filter(d => d.id !== driverId));
            setMessage("Driver successfully deleted!");
        } catch (error) {
            setMessage("Error deleting driver: " + error.message);
        }
    };
    

    return (
        <Box>
            <TextField 
                label="Driver Name" 
                value={newDriver.name} 
                onChange={(e) => setNewDriver(prev => ({ ...prev, name: e.target.value }))} 
            />
            <TextField 
                label="Driver Surname" 
                value={newDriver.surname} 
                onChange={(e) => setNewDriver(prev => ({ ...prev, surname: e.target.value }))} 
            />
            <Button onClick={handleAddDriver}>Add Driver</Button>

            <TextField 
                label="Search Drivers by name" 
                variant="outlined" 
                fullWidth 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <List>
                {drivers.map(driver => (
                    <ListItem key={driver.id}>
                        {driver.name} {driver.surname} - ID: {driver.id}
                        <Button color="secondary" onClick={() => handleDeleteDriver(driver.id)}>Delete</Button>
                    </ListItem>
                ))}
            </List>
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

export default DriverInfo;
