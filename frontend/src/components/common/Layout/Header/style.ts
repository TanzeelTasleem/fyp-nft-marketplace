import styled from "styled-components";
import { white, black_soft, color } from "../../../../styles/colors";


export const Container = styled.div`
    background-color: #403f83;
    position: fixed;
    top:0; left: 0;
    z-index: 100;  
    width: 100%;
    padding: 0 10px;

    >div{
        margin: 0 auto;
        max-width: 1196px;
        display: flex;
        align-items: center;

        @media only screen and (max-width: 1199px) {
            /* width: 916px; */
            width: 100%;
        }
        @media only screen and (max-width: 641px) {
            width: 100%;
        }

        >div{ width: 100%; }
        
        >:nth-child(1){
            
        }

        >:nth-child(2){
            display: flex;
            justify-content: flex-end;
        }

    }

`

export const ProfileMenu = styled.div`
    display: flex;
    align-items: center;
    /* a{
        display: inline-block;
        margin: 0 5px;
    } */

    .navbar-item {
        color: white;
        position: relative;
        display: inline-block;
        padding: 20px 12px;
        height: max-content;
        cursor: pointer;
        .lines{
          /* position: absolute; */
          top: 22px;
          display: block;
          width: 0;
          border-bottom: 2px solid #8364e2;
          transition: .7s;
        }
        &:hover{
          .lines{
            width: 100%;
            transition: .7s;
          }
        }
    }

    .item-dropdown{
      width: max-content;
      position: absolute !important;
      /* margin-left: 10px; */
      top: 65px !important;
      left: -30px !important;
      background: #fff!important;
      border-radius: 5px;
      overflow: hidden;
      inset: 50px auto auto 0;
      padding: 0 0;
      animation: smoothDrop .2s ease;
      -webkit-animation: smoothDrop .2s ease;
      box-shadow: 2px 2px 30px 0px rgba(20, 20, 20, 0.1);
      z-index: 1;
      .dropdown{
        position: relative;
        text-align: center;
        a{
          color: ${black_soft} !important;
          text-transform: none;
          font-weight: normal;
          letter-spacing: normal;
          display: block;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px 20px 8px 20px;
          min-width: 170px;
          width: 100%;
          text-align: left;
          &:hover{
            color: ${white} !important;
            background: ${color};
          }
          &:last-child{
            border-bottom: none;
          }
        }
      }
  }

    >.de-menu-profile {
      margin-left: 10px;
      position: relative;
      cursor: pointer;
      >img {
        width: 38px;
        border-radius: 30px;
        -moz-border-radius: 30px;
        -webkit-border-radius: 30px;
        margin-left: 5px;
        margin-bottom: 2px;
      }
      >.popshow{
        background-color: #fff;
        cursor: default;
        width: 250px;
        position: absolute;
        background: ${white};
        border-radius: 5px;
        overflow: hidden;
        inset: 50px auto auto -200px;
        padding: 20px;
        animation: smoothDrop .2s ease;
        -webkit-animation: smoothDrop .2s ease;
        box-shadow: 2px 2px 30px 0px rgba(20, 20, 20, 0.1);
        z-index: 1;
          >.d-name{
            margin-bottom: 15px;
            >h4 {
              font-weight: bold;
              display: block;
              margin: 0;
              margin-top: 0px;
              padding: 0;
              font-size: 16px;
              margin-top: 5px
            }
          >span.name{
              color: ${color};
              cursor: pointer;
            }
          }
          >.d-balance {
            font-size: 14px;
            margin-bottom: 15px;
            >h4 {
                font-weight: bold;
                display: block;
                margin: 0;
                margin-top: 0px;
                padding: 0;
                font-size: 16px;
                margin-top: 5px;
            }
          }
          >.d-wallet {
            font-size: 14px;
            margin-bottom: 15px;
            >h4 {
                font-weight: bold;
                display: block;
                margin: 0;
                margin-top: 0px;
                padding: 0;
                font-size: 16px;
                margin-top: 5px;
            }
            >.d-wallet-address{
              display: inline-block;
              max-width: 64%;        
              overflow: hidden;
            }
            >#btn_copy{
              margin-left: 15px;
            }
          }
          >.d-line {
            margin: 15px 0 15px 0;
            border-top: solid 1px #bbbbbb;
          }
          >.de-submenu-profile {
            list-style: none;
            margin: 0;
            padding: 0;
            >li {
              border-radius: 18px;
              &:hover {background-color: #8364E233;}
              padding: 5px 2px;
                >span {
                cursor: pointer;
                color: #0d0c22 !important;
                background: none;
                padding: 0;
                font-weight: bold;
                font-size: 14px;
                display: block;
                text-align: left;
                &:hover{
                  box-shadow: none;
                }
                >i {
                  padding: 7px 9px;
                  background: #eee;
                  border-radius: 30px;
                  width: 28px;
                  margin-right: 5px;
                }
              }
            }
          }
      }
  }
`
