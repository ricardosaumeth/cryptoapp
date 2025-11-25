import type { JSX } from "react"
import { Container, Header, Body } from "./Widget.styled"

export interface Props {
  children: JSX.Element
  title: string
}

const Widget = ({ children, title }: Props) => {
  return (
    <Container>
      <Header>{title}</Header>
      <Body>{children}</Body>
    </Container>
  )
}

export default Widget
