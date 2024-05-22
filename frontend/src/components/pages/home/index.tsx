import React, { FC, Component } from 'react';
import { Layout, Seo } from "../../common";
import { PAGES } from '../../../app-config';
import { navigate, PageProps } from 'gatsby';
import { createGlobalStyle } from 'styled-components';
import Reveal from 'react-awesome-reveal';
import { keyframes } from "@emotion/react";
import Particles from "react-tsparticles";
import { useAppSelector } from '../../../redux/store';

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.sticky.white {
    background: #403f83;
    border-bottom: solid 1px #403f83;
  }
  header#myHeader.navbar .search #quick_search{
    color: #403f83;
    background: rgba(255, 255, 255, .1);
  }
  header#myHeader.navbar.white .btn, .navbar.white a, .navbar.sticky.white a{
    color: #403f83;
  }
  header#myHeader .dropdown-toggle::after{
    color: #403f83;
  }
  header#myHeader .logo .d-block{
    display: none !important;
  }
  header#myHeader .logo .d-none{
    display: block !important;
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #403f83;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #fff;
    }
    .item-dropdown .dropdown a{
      color: #fff !important;
    }
  }
`;



const Home: FC<PageProps> = ({ }) => {
  return (
    <Layout>
      <Seo title={PAGES.HOME.title} />
      <GlobalStyles />
      <section className="jumbotron no-bg" style={{ backgroundImage: `url(${'https://gigaland.on3-step.com/img/background/2.jpg'})` }}>
        <Particle />
        <SliderMainParticle />
      </section>

      <section className='container'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='text-center'>
              <h2>Popular Items</h2>
              <div className="small-border"></div>
            </div>
          </div>
        </div>

        {/* <ColumnNewRedux /> */}


      </section>

      <section className='container-fluid bg-gray'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='text-center'>
              <h2>Hot Collections</h2>
              <div className="small-border"></div>
            </div>
          </div>
        </div>
        <div className='container'>
          <div className='row'>
            <div className='col-lg-12'>
              {/* <CarouselCollectionRedux /> */}
            </div>
          </div>
        </div>
      </section>

      <section className='container'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='text-center'>
              <h2>Top Sellers</h2>
              <div className="small-border"></div>
            </div>
          </div>
          <div className='col-lg-12'>
            {/* <AuthorListRedux /> */}
          </div>
        </div>
      </section>

      <section className='container-fluid bg-gray'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='text-center'>
              <h2>Create and sell your NFTs</h2>
              <div className="small-border"></div>
            </div>
          </div>
        </div>
        <div className='container'>
          <FeatureBox />
        </div>
      </section>

      {/* <Footer /> */}

    </Layout>
  )
}

export default Home;








class Particle extends Component {
  constructor(props) {
    super(props);

    this.particlesInit = this.particlesInit.bind(this);
    this.particlesLoaded = this.particlesLoaded.bind(this);
  }

  async particlesInit(main) {
    /*console.log(main);*/
  }

  async particlesLoaded(container) {
    /*console.log(container);*/
  }

  render() {
    return (
      <Particles
        id="tsparticles"
        init={this.particlesInit}
        loaded={this.particlesLoaded}
        options={{
          background: {
            color: {
              value: "none",
            },
          },
          fpsLimit: 70,
          interactivity: {
            detectsOn: "canvas",
            events: {
              onClick: {
                enable: true,
                mode: "push",
              },
              onHover: {
                enable: true,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              bubble: {
                distance: 400,
                duration: 2,
                opacity: 0.8,
                size: 40,
              },
              push: {
                quantity: 1,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: "#ffffff",
            },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            collisions: {
              enable: true,
            },
            move: {
              direction: "none",
              enable: true,
              outMode: "bounce",
              random: false,
              speed: 2,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                value_area: 400,
              },
              value: 20,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle",
            },
            size: {
              random: true,
              value: 5,
            },
          },
          detectRetina: true,
        }}
      />
    );
  }
}

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    -webkit-transform: translateY(40px);
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
`;

const FeatureBox = () => (
  <div className='row'>
    <div className="col-lg-4 col-md-6 mb-3">
      <div className="feature-box f-boxed style-3">
        <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
          <i className="bg-color-2 i-boxed icon_wallet"></i>
        </Reveal>
        <div className="text">
          <Reveal className='onStep' keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
            <h4 className="">Set up your wallet</h4>
          </Reveal>
          <Reveal className='onStep' keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
            <p className="">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem.</p>
          </Reveal>
        </div>
        <i className="wm icon_wallet"></i>
      </div>
    </div>

    <div className="col-lg-4 col-md-6 mb-3">
      <div className="feature-box f-boxed style-3">
        <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
          <i className=" bg-color-2 i-boxed icon_cloud-upload_alt"></i>
        </Reveal>
        <div className="text">
          <Reveal className='onStep' keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
            <h4 className="">Add your NFT's</h4>
          </Reveal>
          <Reveal className='onStep' keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
            <p className="">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem.</p>
          </Reveal>
        </div>
        <i className="wm icon_cloud-upload_alt"></i>
      </div>
    </div>

    <div className="col-lg-4 col-md-6 mb-3">
      <div className="feature-box f-boxed style-3">
        <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
          <i className=" bg-color-2 i-boxed icon_tags_alt"></i>
        </Reveal>
        <div className="text">
          <Reveal className='onStep' keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
            <h4 className="">Sell your NFT's</h4>
          </Reveal>
          <Reveal className='onStep' keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
            <p className="">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem.</p>
          </Reveal>
        </div>
        <i className="wm icon_tags_alt"></i>
      </div>
    </div>
  </div>
);


const fadeInUpSliderMainParticle = keyframes`
  0% {
    opacity: 0;
    -webkit-transform: translateY(40px);
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
`;


const inline = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
 
`;

const SliderMainParticle = () => {
  const userData = useAppSelector(s => s.userAuth.userData);
  return (
    <div className="container">
      <div className="row align-items-center">
        <div className="col-md-6">
          <div className="spacer-single"></div>
          <div className="spacer-double"></div>
          <Reveal className='onStep' keyframes={fadeInUpSliderMainParticle} delay={300} duration={900} triggerOnce>
            <h1 className="col-white">Create, sell or collect digital items.</h1>
          </Reveal>
          <Reveal className='onStep' keyframes={fadeInUpSliderMainParticle} delay={600} duration={900} triggerOnce>
            <p className="lead col-white">
              Unit of data stored on a digital ledger, called a blockchain, that certifies a digital asset to be unique and therefore not interchangeable
            </p>
          </Reveal>
          <div className="spacer-10"></div>
          <Reveal className='onStep d-inline' keyframes={inline} delay={800} duration={900} triggerOnce>
            <span onClick={() => navigate(PAGES.ASSETS.path)} className="btn-main inline lead">Explore</span>
            <span
              style={{ display: userData?.isAdmin ? undefined : "none" }}
              onClick={() => navigate(PAGES.ASSETS.routes.CREATE.fullpath)}
              className="btn-main inline white lead">
              Create
            </span>
            <div className="mb-sm-30"></div>
          </Reveal>
        </div>
      </div>
    </div >
  )
};

