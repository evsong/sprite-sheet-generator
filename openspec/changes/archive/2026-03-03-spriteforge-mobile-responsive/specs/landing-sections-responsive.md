# Spec: Responsive Landing Sections

## REQ-HERO-1: Single Column on Mobile

**Given** viewport width < 768px
**When** Hero section renders
**Then** layout switches to single column (text on top, sprite preview below), h1 font-size reduces to ~28px

## REQ-FEAT-1: Responsive Features Grid

**Given** viewport width < 768px
**When** Features section renders
**Then** grid switches to 1 column; `span 2` cards become `span 1`

**Given** viewport width >= 768px
**Then** grid renders as current 3-column layout

## REQ-HIW-1: Responsive HowItWorks Grid

**Given** viewport width < 768px
**When** HowItWorks section renders
**Then** grid switches to 1 column (steps stacked vertically)

## REQ-PRICE-1: Responsive Pricing Grid

**Given** viewport width < 768px
**When** Pricing section renders
**Then** grid switches to 1 column, featured tier shown first

## REQ-FOOT-1: Responsive Footer Grid

**Given** viewport width < 768px
**When** Footer renders
**Then** grid switches to 2 columns (brand full-width on top, 3 link columns in 2-col grid below)
