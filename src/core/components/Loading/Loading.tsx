import { Container, Title, Animation } from "./Loading.styled"

interface Props {
  title?: string
}

const Loading = ({ title = "Loading..." }: Props) => {
  return (
    <Container>
      <Animation></Animation>
      <Title>{title}</Title>
    </Container>
  )
}

export default Loading
