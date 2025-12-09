import styled from "styled-components"
import Palette from "../../../../theme/style"

export const Container = styled.div`
  width: 100%;
  height: 100%;

  .ag-cell {
    font-size: 12px;
  }

  .selected-row,
  .stale-row {
    font-weight: 700;
    background-color: ${Palette.BackgroundColorOnHover};
  }
`
