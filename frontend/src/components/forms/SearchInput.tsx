import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, InputAdornment } from "@mui/material";
import { ChangeEvent, FC } from "react";
import TextInput from "./TextInput";

type SearchInputProps = {
  value: string;
  label: string;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleCancelSearch: () => void;
};

const SearchInput: FC<SearchInputProps> = ({
  value,
  label,
  handleChange,
  handleCancelSearch,
}) => {
  return (
    <TextInput
      type="text"
      value={value}
      onChange={handleChange}
      label={label}
      autoComplete="off"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            {value && (
              <IconButton onClick={handleCancelSearch}>
                <CloseIcon />
              </IconButton>
            )}
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchInput;
