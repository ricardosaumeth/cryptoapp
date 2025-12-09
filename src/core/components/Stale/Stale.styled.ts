import styled from "styled-components"
import Palette from "../../../theme/style"

export const Container = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${Palette.BackgroundColorOnHover};
  pointer-events: none;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`
