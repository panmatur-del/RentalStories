import { Container, Eyebrow, BtnLink, ContactLink } from "../components/ui.jsx";

export default function NotFound() {
  return (
    <Container className="py-24">
      <Eyebrow className="text-moss">Page not found</Eyebrow>
      <h1 className="mt-4 text-6xl sm:text-8xl">This page moved out.</h1>
      <p className="mt-4 max-w-xl text-xl text-ink-soft">We couldn’t find what you were looking for, but your rental story is still safe and private.</p>
      <BtnLink to="/" className="mt-8" arrow>Back to the home page</BtnLink>
      <p className="mt-6 text-ink-soft">Can’t find something? Use our <ContactLink />.</p>
    </Container>
  );
}
