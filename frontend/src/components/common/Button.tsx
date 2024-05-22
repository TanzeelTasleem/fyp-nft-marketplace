import styled from 'styled-components';

const COLOR = {
    disable: "background: #7e7d80 !important; color: #fff;",
    primary: "background: #8364E2 !important; color: #fff;",
    secondary: "background: #fff !important; color: #8364E2;",
}


interface ButtonProps {
    color?: keyof typeof COLOR
}

// const Button = styled.button.attrs<ButtonProps>(({ color, disabled }) => ({
//     _color: COLOR[disabled ? "disable" : color ? color : "primary"]
// })) <ButtonProps>`
const Button = styled.button<ButtonProps>`
    text-align: center;
    ${({ color, disabled }) => COLOR[disabled ? "disable" : color ? color : "primary"]}
    border-radius: 6px;
    letter-spacing: normal;
    outline: 0;
    font-weight: 800;
    text-decoration: none;
    padding: 6px 20px;
    font-size: 14px;
    border: none;
    box-shadow: 2px 2px 20px 0px rgba(131,100,226, 0);
    transition: all 0.3s ease;
    ${({ disabled }) => disabled ? "cursor: not-allowed !important;" : "cursor: pointer !important;"}
    &:hover{
      box-shadow: 2px 2px 20px 0px rgba(131,100,226, 0.5);
      transition: all 0.3s ease;
    }    
`

export default Button;