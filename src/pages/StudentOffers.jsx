import React, { useState, useRef } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { ChevronLeft, ChevronRight, ChevronDown, Tag, Ticket, Copy, Check } from 'lucide-react';
import tCompanyOfferImg from '../assets/t_company_offer.png';

function OffersSlider() {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollContainerRef = useRef(null);

    const slides = [
        { id: 1, type: 'image', src: tCompanyOfferImg, alt: 'Special Offer' }
    ];

    const scrollTo = (index) => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const slideWidth = container.clientWidth;
        container.scrollTo({
            left: index * slideWidth,
            behavior: 'smooth'
        });
        setActiveIndex(index);
    };

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const scrollPosition = container.scrollLeft;
        const slideWidth = container.clientWidth;
        const newIndex = Math.round(scrollPosition / slideWidth);
        if (newIndex !== activeIndex) {
            setActiveIndex(newIndex);
        }
    };

    const nextSlide = () => {
        if (activeIndex < slides.length - 1) scrollTo(activeIndex + 1);
    };

    const prevSlide = () => {
        if (activeIndex > 0) scrollTo(activeIndex - 1);
    };

    return (
        <div className="relative group">
            <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-gray-50/50">
                <CardContent className="p-0 relative">
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {slides.map((slide) => (
                            <div
                                key={slide.id}
                                className="flex-none w-full snap-center p-4 flex justify-center items-center min-h-[50vh] max-h-[75vh]"
                            >
                                {slide.type === 'image' ? (
                                    <img
                                        src={slide.src}
                                        alt={slide.alt}
                                        className="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-sm"
                                    />
                                ) : (
                                    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                                        <p className="text-gray-400 font-medium">{slide.text}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                        <button
                            onClick={prevSlide}
                            disabled={activeIndex === 0}
                            className="p-2 rounded-full bg-white/80 backdrop-blur shadow-md text-gray-800 hover:bg-white disabled:hidden transition-transform active:scale-95"
                            aria-label="Previous offer"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                        <button
                            onClick={nextSlide}
                            disabled={activeIndex === slides.length - 1}
                            className="p-2 rounded-full bg-white/80 backdrop-blur shadow-md text-gray-800 hover:bg-white disabled:hidden transition-transform active:scale-95"
                            aria-label="Next offer"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Dot Indicators */}
            {slides.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => scrollTo(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                activeIndex === index ? 'bg-indigo-600 w-4' : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function CouponCard() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText('TC173').then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="flex flex-col items-center py-8 px-4">
            {/* Coupon ticket style */}
            <div className="relative w-full max-w-md">
                {/* Dashed border coupon container */}
                <div className="border-2 border-dashed border-indigo-300 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 text-center relative overflow-hidden">
                    {/* Decorative circles on edges */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 border-indigo-200" />
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 border-indigo-200" />

                    <p className="text-sm font-semibold text-indigo-500 uppercase tracking-widest mb-4">Your Coupon Code</p>

                    {/* Large coupon code */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="text-5xl sm:text-6xl font-extrabold tracking-[0.2em] text-indigo-700 font-mono select-all">
                            TC173
                        </span>
                        <button
                            onClick={handleCopy}
                            className="p-2 rounded-lg hover:bg-indigo-100 transition-colors text-indigo-500 hover:text-indigo-700"
                            aria-label="Copy coupon code"
                        >
                            {copied ? <Check className="w-6 h-6 text-green-600" /> : <Copy className="w-6 h-6" />}
                        </button>
                    </div>

                    {copied && (
                        <p className="text-sm text-green-600 font-medium mb-3 animate-fade-in">Copied to clipboard!</p>
                    )}

                    {/* Divider */}
                    <div className="border-t border-dashed border-indigo-200 my-4" />

                    {/* Discount description */}
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">
                        10% off on purchases above ₹300
                    </p>
                    <p className="text-base font-bold text-indigo-600 mt-1">
                        Only on Mondays
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Apply this code at checkout to avail the discount</p>
                </div>
            </div>
        </div>
    );
}

export default function StudentOffers() {
    const [offersOpen, setOffersOpen] = useState(true);
    const [couponOpen, setCouponOpen] = useState(false);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Exclusive student offers.</h1>
                <p className="text-gray-500 text-lg">For MessPro users</p>
            </div>

            {/* Cards Container */}
            <div className="space-y-5 max-w-2xl mx-auto">

                {/* Offers Card */}
                <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <button
                        onClick={() => setOffersOpen(!offersOpen)}
                        className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-gray-50/60 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-sm">
                                <Tag className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Offers</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Browse advertisements &amp; brochures</p>
                            </div>
                        </div>
                        <ChevronDown
                            className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${offersOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    <div
                        className={`transition-all duration-400 ease-in-out overflow-hidden ${offersOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        <div className="border-t border-gray-100 px-4 pb-6 pt-4">
                            <OffersSlider />
                        </div>
                    </div>
                </Card>

                {/* Coupon Card */}
                <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <button
                        onClick={() => setCouponOpen(!couponOpen)}
                        className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-gray-50/60 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm">
                                <Ticket className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Coupon</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Redeem your exclusive discount code</p>
                            </div>
                        </div>
                        <ChevronDown
                            className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${couponOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    <div
                        className={`transition-all duration-400 ease-in-out overflow-hidden ${couponOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        <div className="border-t border-gray-100">
                            <CouponCard />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Global style to hide scrollbar for webkit (Chrome/Safari) */}
            <style dangerouslySetInnerHTML={{__html: `
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}} />
        </div>
    );
}
