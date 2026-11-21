import { Quote } from 'lucide-react';

const stories = [
  { quote: 'I got an answer straight away, and I knew exactly what would happen next.', name: 'Olivia Bennett', role: 'Home services' },
  { quote: 'I did not have to explain the same thing twice.', name: 'Marcus Reed', role: 'Operations' },
  { quote: 'It was easy to get the details across and move on with my day.', name: 'Maya Collins', role: 'Property management' },
  { quote: 'By the time the team followed up, the important details were already there.', name: 'Ethan Brooks', role: 'Professional services' },
  { quote: 'I could ask a straightforward question and get a useful answer instead of being left waiting for a callback.', name: 'Sofia Hayes', role: 'Customer experience' },
  { quote: 'It felt like the business was ready to help, even when the team was busy with other customers.', name: 'Daniel Foster', role: 'Field services' },
  { quote: 'The next step was clear, and I knew what information was needed.', name: 'Chloe Morgan', role: 'Local business' },
  { quote: 'A much more considered first impression: clear answers, less back-and-forth, and a proper follow-through.', name: 'Noah Carter', role: 'Service operations' },
];

function StoryCard({ story, index }: { story: typeof stories[number]; index: number }) {
  return (
    <article className="rin-review-card">
      <div className="rin-review-card-top">
        <span className="rin-review-index">0{index + 1}</span>
        <Quote size={22} aria-hidden="true" />
      </div>
      <blockquote>“{story.quote}”</blockquote>
      <div className="rin-review-person">
        <div>
          <strong>{story.name}</strong>
          <span>{story.role}</span>
        </div>
      </div>
    </article>
  );
}

export function Reviews() {
  return (
    <section id="reviews" className="rin-section rin-reviews">
      <div className="rin-container">
        <div className="rin-overline">
          <span>05 / CUSTOMER STORIES</span>
          <span>THE DIFFERENCE IS IN THE DETAILS</span>
        </div>
        <div className="rin-heading-row">
          <h2>A better first impression<br /><em>speaks for itself.</em></h2>
          <p>What callers remember after they hang up.</p>
        </div>
        <div className="rin-review-grid">
          {stories.map((story, index) => <StoryCard key={story.name} story={story} index={index} />)}
        </div>
        <div className="rin-review-bottom">
          <span className="rin-mini-label">BUILT AROUND REAL CONVERSATIONS</span>
          <a href="#contact" className="rin-text-link">Design your customer experience <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>
  );
}
