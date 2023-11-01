import React, { useState, useEffect } from "react";
import TourSearchForm from "../components/TourSearchForm";
import TourSearchResults from "../components/TourSearchResults";

function TourSearchPage() {
    const [tours, setTours] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchTours(); 
    }, []);

    const fetchTours = async (id = null) => {
        let endpoint = id ? `http://localhost:8080/api/tours?searchId=${id}` : "http://localhost:8080/api/tours";
        
        try {
            let response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            let data = await response.json();
            setTours(data);
        } catch (error) {
            console.log("There was a problem with the fetch operation:", error.message);
        }
    }
    

    const handleInputChange = (value) => {
        setSearchTerm(value);
    }

    const handleSearch = (id) => {
        if(id.trim() === "") {
            fetchTours();
        } else {
            fetchTours(id);
        }
    }

    return (
        <div>
            <TourSearchForm onSearch={handleSearch} onInputChange={handleInputChange} />
            {tours.length > 0 && <TourSearchResults tours={tours} />}
        </div>
    );
}

export default TourSearchPage;
