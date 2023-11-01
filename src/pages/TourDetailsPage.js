import React, { useState, useEffect } from "react";
import { fetchData } from "../utils/apiHelper";
import { useParams } from 'react-router-dom';
import { Box, Button, List, ListItem, TextField, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText } from "@mui/material";

import MapComponent from './../components/MapComponent';
import Autocomplete from '@mui/material/Autocomplete';

async function getCoordinatesFromAddress(address) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);
    const data = await response.json();
    if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
}

function TourDetailsPage() {
    const { tourId } = useParams();
    const [tour, setTour] = useState(null);
    const [drivers, setDrivers] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState('');
    const [selectedContracts, setSelectedContracts] = useState([]);
    const [error, setError] = useState(null);
    const [contractCoordinates, setContractCoordinates] = useState([]);
    const [isReorderDialogOpen, setReorderDialogOpen] = useState(false);
    const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        async function fetchTourDataAndCoordinates() {
            const [fetchedTour, fetchedDrivers, fetchedContracts] = await Promise.all([
                fetchData(`http://localhost:8080/api/tours/${tourId}`),
                fetchData("http://localhost:8080/api/drivers"),
                fetchData("http://localhost:8080/api/contracts")
            ]);

            setTour(fetchedTour);
            setDrivers(fetchedDrivers);
            setContracts(fetchedContracts);

            const coordinates = await Promise.all(fetchedTour.contracts.map(async contract => {
                if (!contract || !contract.deliveryAddress) return null;
                const coords = await getCoordinatesFromAddress(contract.deliveryAddress);
                return coords ? { id: contract.id, coordinates: coords, name: contract.deliveryAddress } : null;
            }));
            
            setContractCoordinates(coordinates);
        }
        fetchTourDataAndCoordinates();
    }, [tourId]);

    const handleAssignDriverToTour = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/tours/${tourId}/assign-driver/${selectedDriver}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
    
            const updatedTour = await response.json();
            setTour(updatedTour);
            setMessage("Driver successfully assigned!");
        } catch (error) {
            setMessage(error.message);
        }
    };
    

    const handleRemoveContractFromTour = async (contractId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/tours/${tourId}/contracts/${contractId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
    
            if (!response.ok) {
                throw new Error('Something went wrong while removing the contract.');
            }
    
            const updatedTour = await response.json();
            setTour(updatedTour);
            setMessage("Contract successfully removed!"); 
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            setMessage(error.message);
        }
    };
    

    const moveContractInList = (index, direction) => {
        const newContracts = [...tour.contracts];
        const [movedContract] = newContracts.splice(index, 1);
        newContracts.splice(index + direction, 0, movedContract);
        setTour({ ...tour, contracts: newContracts });
    };

    const handleSaveOrder = async () => {
        const contractIds = tour.contracts.map(contract => contract && contract.id).filter(Boolean);
        try {
            await fetch(`http://localhost:8080/api/tours/${tourId}/reorder-contracts`, {
                method: 'PUT',
                body: JSON.stringify(contractIds),
                headers: { 'Content-Type': 'application/json' },
            });
            
            setReorderDialogOpen(false);
            
            const fetchedTour = await fetchData(`http://localhost:8080/api/tours/${tourId}`);
            setTour(fetchedTour);
            
            const coordinates = await Promise.all(fetchedTour.contracts.map(async contract => {
                const coords = await getCoordinatesFromAddress(contract.deliveryAddress);
                return coords ? { id: contract.id, coordinates: coords, name: contract.deliveryAddress } : null;
            }));
            setContractCoordinates(coordinates);
    
            setIsSuccessDialogOpen(true);
        } catch (error) {
            setMessage("There was a problem saving the order: " + error.message);
        }
    };

    const handleAddContractsToTour = async () => {
        try {
            
            const response = await fetch(`http://localhost:8080/api/tours/${tourId}/add-contracts`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contractIds: selectedContracts })
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
    
            const updatedTour = await response.json();
            setTour(updatedTour);
            setMessage("Contracts successfully added!");
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            setMessage(error.message);
        }
    };
    
    if (error) {
        return <p>Error: {error}</p>;
    }
    if (!tour || !contractCoordinates) {
        return <Box>Loading...</Box>;
    }
    
    return (
        <Box display="flex" flexDirection="column">

        <Box display="flex" justifyContent="space-between" mb={2}>
            <Box>
                <h2>Tour Details</h2>
                <p>Date: {tour.tourDate}</p>
                <p>Driver: {tour.driver?.name || 'No driver assigned'} {tour.driver?.surname || ''}</p>
            </Box>
    
            <Box>
                <h3>Assign Driver:</h3>
                <Autocomplete
                    value={drivers.find(driver => driver.id === selectedDriver)}
                    onChange={(event, newValue) => setSelectedDriver(newValue ? newValue.id : '')}
                    options={drivers}
                    getOptionLabel={(option) => `${option.name} ${option.surname}`}
                    renderInput={(params) => <TextField {...params} label="Select Driver" sx={{ width: 300 }} />}
                />
                <Button onClick={handleAssignDriverToTour}>Assign Driver</Button>
            </Box>
    
            <Box>
                <h3>Add Contracts:</h3>
                <Autocomplete
                    multiple
                    value={contracts.filter(contract => selectedContracts.includes(contract.id))}
                    onChange={(event, newValues) => setSelectedContracts(newValues.map(value => value.id))}
                    options={contracts}
                    getOptionLabel={(option) => `${option.contractNumber} - ${option.customerName} - ${option.deliveryAddress}`}
                    renderInput={(params) => <TextField {...params} label="Select Contracts" sx={{ width: 300 }} />}
                />
                <Button onClick={handleAddContractsToTour}>Add Contracts</Button>
            </Box>
        </Box>
    
        <h3>Contracts:</h3>
        <List>
            {tour && tour.contracts && tour.contracts
                .filter(contract => contract !== null)
                .filter((contract, index, self) => index === self.findIndex(t => t.id === contract.id))
                .map((contract) => (
                    <ListItem key={contract.id}>
                        {contract.contractNumber} - {contract.customerName} - {contract.deliveryAddress}
                        <Button color="secondary" onClick={() => handleRemoveContractFromTour(contract.id)}>Delete</Button>
                    </ListItem>
            ))}
        </List>
    
        <Button onClick={() => setReorderDialogOpen(true)}>Reorder Routes</Button>
    
        <Dialog open={isReorderDialogOpen} onClose={() => setReorderDialogOpen(false)}>
            <DialogTitle>Reorder Routes</DialogTitle>
            <DialogContent>
                <List>
                    {tour && tour.contracts 
                        .filter(contract => contract !== null)
                        .filter((contract, index, self) => index === self.findIndex(t => t.id === contract.id))
                        .map((contract, index) => (
                            <ListItem key={contract.id}>
                                {contract.contractNumber}
                                <Button disabled={index === 0} onClick={() => moveContractInList(index, -1)}>Up</Button>
                                <Button disabled={index === tour.contracts.length - 1} onClick={() => moveContractInList(index, 1)}>Down</Button>
                            </ListItem>
                        ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSaveOrder}>Save</Button>
                <Button onClick={() => setReorderDialogOpen(false)}>Cancel</Button>
            </DialogActions>
        </Dialog>
    
        <Box mt={2}>
            <h3>Route:</h3>
            <MapComponent deliveryAddresses={contractCoordinates} />
        </Box>

            <Dialog
  open={isSuccessDialogOpen}
  onClose={() => setIsSuccessDialogOpen(false)}
>
  <DialogTitle>Success</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Order saved successfully!
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setIsSuccessDialogOpen(false)} color="primary">
      OK
    </Button>
  </DialogActions>
</Dialog>

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
export default TourDetailsPage;
