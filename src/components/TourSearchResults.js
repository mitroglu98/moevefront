import { Table, TableBody, TableCell, TableHead, TableRow, Button } from "@mui/material";
import { useNavigate } from 'react-router-dom';
function TourSearchResults({ tours }) {

    const navigate = useNavigate();

    const handleSelectTour = (tourId) => {
        navigate(`/tour-details/${tourId}`);
    };
    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Tour ID</TableCell>
                    <TableCell>Tour Driver Name</TableCell>
                    <TableCell>Tour Date</TableCell>
                    <TableCell>Action</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {tours.map((tour) => (
                    <TableRow key={tour.id}>
                        <TableCell>{tour.id}</TableCell>
                        <TableCell>{tour.driver && tour.driver.name ? tour.driver.name : "Driver not yet added"}</TableCell>
                        <TableCell>{tour.tourDate}</TableCell>
                        <TableCell>
                            <Button variant="outlined" color="primary" onClick={() => handleSelectTour(tour.id)}>
                               View details
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default TourSearchResults;
