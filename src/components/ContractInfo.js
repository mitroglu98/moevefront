import React, { useState, useEffect } from "react";
import { fetchData } from "../utils/apiHelper";
import { Box, TextField, List, ListItem, Button,Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText } from "@mui/material";
import { debounce } from 'lodash';
function ContractInfo() {
    const [contracts, setContracts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newContract, setNewContract] = useState({ contractNumber: "", customerName: "", deliveryAddress: "" });
    const [message, setMessage] = useState(null);
    useEffect(() => {
        const debouncedFetch = debounce(() => fetchContracts(), 300);
        debouncedFetch();
    
        return () => debouncedFetch.cancel();
    }, [searchTerm]);
    

    const fetchContracts = async () => {
        const endpoint = searchTerm
            ? `http://localhost:8080/api/contracts/search?contractNumber=${searchTerm}`
            : "http://localhost:8080/api/contracts";
        
        try {
            const data = await fetchData(endpoint);
            setContracts(data);
        } catch (error) {
            console.log("There was a problem fetching contracts:", error.message);
        }
    };

    const handleDeleteContract = async (contractId) => {
        try {
            await fetchData(`http://localhost:8080/api/contracts/${contractId}`, 'DELETE');
            setContracts(prevContracts => prevContracts.filter(c => c.id !== contractId));
            setMessage("Contract successfully deleted!");
        } catch (error) {
            setMessage("Error deleting contract: " + error.message);
        }
    };
    

    const handleAddContract = async () => {
        if (!newContract.contractNumber || !newContract.customerName || !newContract.deliveryAddress) {
            setMessage("All fields must be filled out!");
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/contracts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newContract)
            });
    
            const contentType = response.headers.get("content-type");
            
            if (!response.ok) {
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    throw new Error( "Something went wrong with the server.");
                } else {
                    throw new Error("Contract with that contract number already exist");
                }
            }
    
            const addedContract = await response.json();
            setContracts(prevContracts => [...prevContracts, addedContract]);
            setMessage("Contract successfully added!");
        } catch (error) {
            setMessage("Error adding contract: " + error.message);
        }
    };
    return (
        <Box>
            <TextField 
                label="Contract Number" 
                value={newContract.contractNumber} 
                onChange={(e) => setNewContract(prev => ({ ...prev, contractNumber: e.target.value }))} 
            />
            <TextField 
                label="Customer Name" 
                value={newContract.customerName} 
                onChange={(e) => setNewContract(prev => ({ ...prev, customerName: e.target.value }))} 
            />
            <TextField 
                label="Delivery Address" 
                value={newContract.deliveryAddress} 
                onChange={(e) => setNewContract(prev => ({ ...prev, deliveryAddress: e.target.value }))} 
            />
            <Button onClick={handleAddContract}>Add Contract</Button>

            <TextField 
                label="Search Contracts by contract number" 
                variant="outlined" 
                fullWidth 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <List>
                {contracts.map(contract => (
                    <ListItem key={contract.id}>
                        {contract.contractNumber} - {contract.customerName} - {contract.deliveryAddress}
                        <Button color="secondary" onClick={() => handleDeleteContract(contract.id)}>Delete</Button>
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

export default ContractInfo;
