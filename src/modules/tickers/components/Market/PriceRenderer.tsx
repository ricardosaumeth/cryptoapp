import { useState, memo } from "react"
import UpdateHighlight from "../../../../core/components/UpdateHighlight/UpdateHighlight"

interface Props {
  valueFormatted: string
}

const PriceRenderer = memo((props: Props) => {
  const [valueFormatted, setValueFormatted] = useState(props.valueFormatted)

  // AG Grid calls this method to refresh the cell
  ;(PriceRenderer as any).refresh = (params: Props) => {
    setValueFormatted(params.valueFormatted)
    return true
  }

  return <UpdateHighlight value={valueFormatted} />
})

export default PriceRenderer
