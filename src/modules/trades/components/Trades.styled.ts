import styled from "styled-components"
import Palette from "../../../theme/style"

export const Container = styled.div`
  width: 100%;
  height: calc(100% - 20px);
`

export const Header = styled.div`
  height: 20px;
  color: ${Palette.White};

  > span {
    color: ${Palette.Label};
  }
`
