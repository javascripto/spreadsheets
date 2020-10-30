import React from 'react'
import styled from 'styled-components'
import { FiLogOut } from 'react-icons/fi'
import { FiMenu } from 'react-icons/fi'

const Container = styled.header`
  color: #fff;
  height: 64px;
  background: rgb(51, 68, 68);
  box-shadow: -3px 2px 4px 0px rgba(0, 0, 0, 0.5);
  display: flex;
  padding: 0 20px;

  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  span {
    color: #11bb77;
    margin-left: 10px
  }

  .spacer {
    flex: 1;
  }

  svg {
    cursor: pointer
  }
`

export const Header = () => {
  return (
    <Container>
      <FiMenu size={25} />
      <h1>
        <span>C</span> Empresa
      </h1>
      <span className="spacer" />
      <FiLogOut color="#fff" size={25} />
    </Container>
  )
}
