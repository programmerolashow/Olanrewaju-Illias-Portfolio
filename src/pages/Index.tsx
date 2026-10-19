import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Articles from "@/components/Articles";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import ScrollSection from "@/components/ScrollSection";
import { usePageMeta } from "@/hooks/use-page-meta";

// Home is the overview: Services, Projects and Articles show previews that link to their own pages,
// and Moments lives on /moments.
const Index = () => {
  usePageMeta();

  return (
    <>
      <Hero />
      <ScrollSection>
        <About />
      </ScrollSection>
      <ScrollSection>
        <Services />
      </ScrollSection>
      <ScrollSection>
        <Skills />
      </ScrollSection>
      <ScrollSection>
        <Experience />
      </ScrollSection>
      <ScrollSection>
        <Projects />
      </ScrollSection>
      <ScrollSection>
        <Testimonials />
      </ScrollSection>
      <ScrollSection>
        <Articles />
      </ScrollSection>
      <ScrollSection>
        <Contact />
      </ScrollSection>
    </>
  );
};

export default Index;
