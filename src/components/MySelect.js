import React, { useState } from 'react';

import PropTypes from 'prop-types';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';

import HtmlTooltip from './HtmlTooltip';


export default function MySelect(props) {
  const { name, options, helperText, value, handleChange, isError, tooltip, minwidth, addempty, } = props;

  const labelId = `${name}-label`;
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleTooltip = bool => {
      setTooltipOpen(bool);
  }

  const myHandleChange = (e) => {
    setTooltipOpen(false);
    handleChange(e);
  }

  return (
    <HtmlTooltip arrow title={tooltip} open={tooltipOpen}>
      <FormControl style={{minWidth: minwidth}}>
        <InputLabel id={labelId} shrink>{name}</InputLabel>
        <Select
          native
          style={{minWidth: minwidth}}
          labelId={labelId}
          margin="dense"
          value={value}
          onChange={myHandleChange}
          error={isError()}
          onMouseEnter={() => {handleTooltip(true)}}
          onMouseLeave={() => {handleTooltip(false)}}
          onOpen={() => {handleTooltip(false)}}
        >
          {/* filter the 2-letter states from CO2Factors keys */}
          {addempty ? <option key="none" aria-label="None" value="" /> : ""}
          {
            options.map((option) => {
              return (
                <option key={option} value={option}>
                  {option}
                </option>
              );
            })
          }
        </Select>
        <FormHelperText>{isError() ? helperText : ""}</FormHelperText>
      </FormControl>
    </HtmlTooltip>
  );
};

MySelect.propTypes = {
  name:         PropTypes.string.isRequired,
  options:      PropTypes.array.isRequired,
  helperText:   PropTypes.string.isRequired,
  value:        PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  isError:      PropTypes.func.isRequired,
  tooltip:      PropTypes.element.isRequired,
  minwidth:     PropTypes.number,
  addempty:     PropTypes.bool,
};

MySelect.defaultProps = {
  minwidth:     120,
  addempty:     true,
};
