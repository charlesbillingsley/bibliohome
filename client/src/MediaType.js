import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';

export default function MediaType(props) {
    const [mediaTypeOptions, setMediaTypeOptions] = useState([]);

    useEffect(() => {
        axios.get('/mediatype')
        .then(function (response) {
            setMediaTypeOptions(response.data);
        })
        .catch(function (error) {
            console.log(error.message);
        })
    }, []);

    const inputChanged = (e, newValue) => {
        var selected_option = (
            mediaTypeOptions.find(
                i => i.name === newValue
            )
        )
        selected_option = (
            selected_option || {name: newValue, id: -1}
        );
        props.setMediaType(selected_option);
    }

    return (
        <Autocomplete 
            id="media-type-entry"
            options={mediaTypeOptions}
            getOptionLabel={(option) => option.name || option}
            onInputChange={inputChanged}
            renderInput={(params) => (
                <TextField 
                    {...params} 
                    label="Media Type"
                    helperText={props.mediaTypeError}
                    error={props.mediaTypeError.length > 0}
                />
            )}
        >
        </Autocomplete>
    )
}
