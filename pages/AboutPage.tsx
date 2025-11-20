import React from 'react';
import { CheckIcon } from '../components/Icons';
import { useAppContext } from '../context/AppContext';

const AboutPage: React.FC = () => {
  const { aboutPageContent } = useAppContext();

  return (
    <div className="bg-surface p-6 sm:p-8 rounded-lg shadow-lg animate-fade-in-up">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-2">{aboutPageContent.title}</h1>
          <p className="text-lg text-gray-600">{aboutPageContent.subtitle}</p>
        </header>

        {/* Visi Misi Section */}
        <section className="mb-12 p-8 bg-blue-50 rounded-xl border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
                <div>
                    <h2 className="text-2xl font-semibold text-primary mb-3">{aboutPageContent.visionTitle}</h2>
                    <p className="text-gray-700">{aboutPageContent.visionText}</p>
                </div>
                <div>
                    <h2 className="text-2xl font-semibold text-primary mb-3">{aboutPageContent.missionTitle}</h2>
                    <ul className="text-left space-y-2 text-gray-700">
                        {aboutPageContent.missionItems.map((item, index) => (
                           <li key={index} className="flex items-start"><CheckIcon className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-1"/>{item}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>

        {/* Sejarah Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-center mb-6">{aboutPageContent.historyTitle}</h2>
          <p className="text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
            {aboutPageContent.historyText}
          </p>
        </section>

        {/* Galeri Section */}
        <section className="mb-12">
            <h2 className="text-3xl font-semibold text-center mb-6">{aboutPageContent.galleryTitle}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {aboutPageContent.galleryImages.map((src, index) => (
                    <img key={index} src={src} alt={`Gallery image ${index + 1}`} className="rounded-lg shadow-md aspect-square object-cover hover:scale-105 transition-transform duration-300"/>
                ))}
            </div>
        </section>

        {/* Lokasi Section */}
        <section>
          <h2 className="text-3xl font-semibold text-center mb-6">{aboutPageContent.locationTitle}</h2>
          <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-xl border">
             <iframe 
                src={aboutPageContent.locationMapUrl}
                width="100%" 
                height="450" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy"
                title="Lokasi Koperasi MASTER"
             ></iframe>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;