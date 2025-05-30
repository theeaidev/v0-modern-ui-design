import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// This is a simple example component
const Button = ({ 
  onClick, 
  children 
}: { 
  onClick: () => void, 
  children: React.ReactNode 
}) => {
  return (
    <button onClick={onClick} data-testid="test-button">
      {children}
    </button>
  )
}

// This is the test for the Button component
describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button onClick={() => {}}>Click me</Button>)
    
    const buttonElement = screen.getByTestId('test-button')
    expect(buttonElement).toBeInTheDocument()
    expect(buttonElement).toHaveTextContent('Click me')
  })

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const buttonElement = screen.getByTestId('test-button')
    await userEvent.click(buttonElement)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})