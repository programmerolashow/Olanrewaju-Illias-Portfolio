import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Articles from "@/components/Articles";
import Contact from "@/components/Contact";
import { usePageMeta } from "@/hooks/use-page-meta";

// Home is the overview: Services, Projects and Articles show previews that link to their own pages,
// and Moments lives on /moments.
const Index = () => {
  usePageMeta();

  return (
    <>
      <Hero />
      <About />
      <Services />
      <Skills />
      <Experience />
      <Projects />
      <Articles />
      <Contact />
    </>
  );
};

export default Index;
