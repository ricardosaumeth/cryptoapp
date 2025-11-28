import styled from "styled-components"
import Palette from "../../../../theme/style"

export const Container = styled.div`
  width: 100%;
  height: 100%;

  .ag-cell {
    font-size: 12px;
  }

  .selected-row {
    font-family: FiraSans-Medium;
    background-color: ${Palette.BackgroundColorOnHover};
  }
`
