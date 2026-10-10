const pptxgen = require('pptxgenjs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Colors matching the Code Carnival 3.0 template
const COLORS = {
  BG_DARK: '111215',
  BG_LIGHT: 'FAF7F2',
  CARD_DARK: '1A1C20',
  CARD_DARK_BORDER: '2A2D34',
  CARD_LIGHT: 'FFFFFF',
  CARD_LIGHT_BORDER: 'E5E0D8',
  RED_PRIMARY: 'C62828',
  RED_ACCENT: 'E53935',
  TEXT_DARK: '111215',
  TEXT_MUTED: '666666',
  TEXT_LIGHT: 'FFFFFF',
  TEXT_LIGHT_MUTED: 'D0D0D0',
  PASS_GREEN: '15803D',
  REJECT_RED: 'DC2626',
  REVIEW_AMBER: 'D97706',
  UNINSPECT_SLATE: '475569',
  BLUE_ACCENT: '1D4ED8'
};

const FONTS = {
  HEADING: 'Arial', // Compatible fallback for Oswald
  BODY: 'Calibri'   // Compatible fallback for Public Sans
};

async function generatePPTX() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches (or 13.33 x 7.5)
  pres.author = 'QualityIQ Team';
  pres.company = 'Atmiya University - ADSC Code Carnival 3.0';
  pres.title = 'QualityIQ - Idea Submission Presentation';

  // Helper for Top Banner on Content Slides (Slides 2 to 9)
  function addHeaderBranding(slide, sectionNum, sectionKicker, slideTitle) {
    // Top Left: Atmiya University
    slide.addText('ATMIYA UNIVERSITY\nRAJKOT, GUJARAT (INDIA)', {
      x: 0.6,
      y: 0.35,
      w: 3.5,
      h: 0.6,
      fontSize: 10,
      fontFace: FONTS.HEADING,
      bold: true,
      color: COLORS.TEXT_DARK,
      lineSpacing: 13
    });

    // Top Right: RIT + ADSC
    slide.addText('RIT   |   ADSC', {
      x: 9.8,
      y: 0.4,
      w: 2.8,
      h: 0.45,
      fontSize: 12,
      fontFace: FONTS.HEADING,
      bold: true,
      align: 'right',
      color: COLORS.RED_PRIMARY
    });

    // Red Divider Line
    slide.addShape(pres.ShapeType.line, {
      x: 0.6,
      y: 0.95,
      w: 12.13,
      h: 0,
      line: { color: COLORS.RED_PRIMARY, width: 2 }
    });

    // Section Kicker (e.g. "01 · THE TARGET")
    slide.addText(`${sectionNum} · ${sectionKicker}`, {
      x: 0.6,
      y: 1.15,
      w: 6.0,
      h: 0.3,
      fontSize: 11,
      fontFace: FONTS.HEADING,
      bold: true,
      color: COLORS.RED_PRIMARY,
      charSpacing: 2
    });

    // Main Slide Title
    slide.addText(slideTitle, {
      x: 0.6,
      y: 1.45,
      w: 12.0,
      h: 0.55,
      fontSize: 24,
      fontFace: FONTS.HEADING,
      bold: true,
      color: COLORS.TEXT_DARK
    });
  }

  // Helper for Slide Footer
  function addFooter(slide) {
    slide.addText('Code Carnival 3.0 · ADSC, Atmiya University', {
      x: 0.6,
      y: 7.0,
      w: 6.0,
      h: 0.3,
      fontSize: 9,
      fontFace: FONTS.BODY,
      color: COLORS.TEXT_MUTED
    });

    slide.addText('[TEAM NAME]', {
      x: 10.0,
      y: 7.0,
      w: 2.7,
      h: 0.3,
      fontSize: 10,
      fontFace: FONTS.HEADING,
      bold: true,
      align: 'right',
      color: COLORS.RED_PRIMARY
    });
  }

  // ==========================================
  // SLIDE 1: Title Slide
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.BG_DARK };

    // Left red accent vertical bar
    slide.addShape(pres.ShapeType.rect, {
      x: 0.0,
      y: 1.2,
      w: 0.12,
      h: 5.1,
      fill: { color: COLORS.RED_PRIMARY }
    });

    // Top Header logos in white box / text
    slide.addText('ATMIYA UNIVERSITY · RAJKOT', {
      x: 0.8,
      y: 0.5,
      w: 4.0,
      h: 0.4,
      fontSize: 11,
      fontFace: FONTS.HEADING,
      bold: true,
      color: COLORS.TEXT_LIGHT
    });

    slide.addText('RIT  |  ADSC', {
      x: 9.8,
      y: 0.5,
      w: 2.7,
      h: 0.4,
      fontSize: 12,
      fontFace: FONTS.HEADING,
      bold: true,
      align: 'right',
      color: COLORS.RED_ACCENT
    });

    // Kicker
    slide.addText('ATMIYA DEVELOPER STUDENTS CLUB PRESENTS', {
      x: 0.8,
      y: 1.7,
      w: 10.0,
      h: 0.3,
      fontSize: 11,
      fontFace: FONTS.HEADING,
      bold: true,
      color: COLORS.RED_ACCENT,
      charSpacing: 3
    });

    // Grand Title
    slide.addText('CODE CARNIVAL 3.0', {
      x: 0.8,
      y: 2.1,
      w: 11.5,
      h: 1.1,
      fontSize: 54,
      fontFace: FONTS.HEADING,
      bold: true,
      color: COLORS.TEXT_LIGHT
    });

    // Subtitle & Project Tagline
    slide.addText('QualityIQ: Adaptive Industrial Quality Intelligence Platform\n"Don\'t just detect defects. Decide quality, recover from bad inspections, and explain what is happening on the line."', {
      x: 0.8,
      y: 3.3,
      w: 11.5,
      h: 0.75,
      fontSize: 14,
      fontFace: FONTS.BODY,
      color: COLORS.TEXT_LIGHT_MUTED,
      lineSpacing: 18
    });

    // Bottom Grid: 5 Team Fields Cards
    const cardY = 4.4;
    const cardH = 1.05;

    // Card 1: Team Name
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: cardY, w: 3.6, h: cardH,
      fill: { color: COLORS.CARD_DARK },
      line: { color: COLORS.CARD_DARK_BORDER, width: 1 },
      rectRadius: 0.08
    });
    slide.addText('TEAM NAME', { x: 1.0, y: cardY + 0.12, w: 3.2, h: 0.25, fontSize: 9, bold: true, color: COLORS.RED_ACCENT });
    slide.addText('[Your team name]', { x: 1.0, y: cardY + 0.42, w: 3.2, h: 0.4, fontSize: 13, bold: true, color: COLORS.TEXT_LIGHT });

    // Card 2: Team ID
    slide.addShape(pres.ShapeType.roundRect, {
      x: 4.7, y: cardY, w: 3.6, h: cardH,
      fill: { color: COLORS.CARD_DARK },
      line: { color: COLORS.CARD_DARK_BORDER, width: 1 },
      rectRadius: 0.08
    });
    slide.addText('TEAM ID', { x: 4.9, y: cardY + 0.12, w: 3.2, h: 0.25, fontSize: 9, bold: true, color: COLORS.RED_ACCENT });
    slide.addText('[ID from the ADSC portal]', { x: 4.9, y: cardY + 0.42, w: 3.2, h: 0.4, fontSize: 13, bold: true, color: COLORS.TEXT_LIGHT });

    // Card 3: Team Leader
    slide.addShape(pres.ShapeType.roundRect, {
      x: 8.6, y: cardY, w: 3.9, h: cardH,
      fill: { color: COLORS.CARD_DARK },
      line: { color: COLORS.CARD_DARK_BORDER, width: 1 },
      rectRadius: 0.08
    });
    slide.addText('TEAM LEADER', { x: 8.8, y: cardY + 0.12, w: 3.5, h: 0.25, fontSize: 9, bold: true, color: COLORS.RED_ACCENT });
    slide.addText('[Full name]', { x: 8.8, y: cardY + 0.42, w: 3.5, h: 0.4, fontSize: 13, bold: true, color: COLORS.TEXT_LIGHT });

    // Card 4: Problem Statement Title (Row 2)
    const cardY2 = 5.65;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: cardY2, w: 7.5, h: cardH,
      fill: { color: COLORS.CARD_DARK },
      line: { color: COLORS.CARD_DARK_BORDER, width: 1 },
      rectRadius: 0.08
    });
    slide.addText('PROBLEM STATEMENT TITLE', { x: 1.0, y: cardY2 + 0.12, w: 7.0, h: 0.25, fontSize: 9, bold: true, color: COLORS.RED_ACCENT });
    slide.addText('Industrial Visual Quality Inspection with AI', { x: 1.0, y: cardY2 + 0.42, w: 7.0, h: 0.4, fontSize: 13, bold: true, color: COLORS.TEXT_LIGHT });

    // Card 5: Theme / Track
    slide.addShape(pres.ShapeType.roundRect, {
      x: 8.6, y: cardY2, w: 3.9, h: cardH,
      fill: { color: COLORS.CARD_DARK },
      line: { color: COLORS.CARD_DARK_BORDER, width: 1 },
      rectRadius: 0.08
    });
    slide.addText('THEME / TRACK', { x: 8.8, y: cardY2 + 0.12, w: 3.5, h: 0.25, fontSize: 9, bold: true, color: COLORS.RED_ACCENT });
    slide.addText('AI and Computer Vision / Smart Manufacturing', { x: 8.8, y: cardY2 + 0.42, w: 3.5, h: 0.4, fontSize: 13, bold: true, color: COLORS.TEXT_LIGHT });
  }

  // ==========================================
  // SLIDE 2: 01 · THE TARGET | PROBLEM STATEMENT & UNDERSTANDING
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.BG_LIGHT };
    addHeaderBranding(slide, '01', 'THE TARGET', 'PROBLEM STATEMENT & UNDERSTANDING');
    addFooter(slide);

    // Left Card: PROBLEM STATEMENT
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.6, y: 2.15, w: 5.9, h: 4.6,
      fill: { color: COLORS.CARD_LIGHT },
      line: { color: COLORS.CARD_LIGHT_BORDER, width: 1 },
      rectRadius: 0.08
    });
    slide.addText('PROBLEM STATEMENT', {
      x: 0.9, y: 2.4, w: 5.3, h: 0.4,
      fontSize: 16, fontFace: FONTS.HEADING, bold: true, color: COLORS.RED_PRIMARY
    });
    slide.addText([
      { text: 'Surface defects, missing parts, and orientation errors bypass manual QC\n', options: { bullet: true } },
      { text: 'High line speeds cause severe operator fatigue, missed flaws, and scrap waste\n', options: { bullet: true } },
      { text: 'Moving parts, glare, and vibration trigger false rejects in naive AI detectors\n', options: { bullet: true } },
      { text: 'Directly impacts manufacturing plant managers, QC inspectors, and assembly lines', options: { bullet: true } }
    ], {
      x: 0.9, y: 3.0, w: 5.3, h: 3.5,
      fontSize: 18, fontFace: FONTS.BODY, color: COLORS.TEXT_DARK, lineSpacing: 26
    });

    // Right Card: OUR UNDERSTANDING
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.8, y: 2.15, w: 5.9, h: 4.6,
      fill: { color: COLORS.CARD_LIGHT },
      line: { color: COLORS.CARD_LIGHT_BORDER, width: 1 },
      rectRadius: 0.08
    });
    slide.addText('OUR UNDERSTANDING', {
      x: 7.1, y: 2.4, w: 5.3, h: 0.4,
      fontSize: 16, fontFace: FONTS.HEADING, bold: true, color: COLORS.RED_PRIMARY
    });
    slide.addText([
      { text: 'Root cause: Factory vision needs decisions and recovery, not just raw detection\n', options: { bullet: true } },
      { text: 'Existing gap: Binary bounding-box models fail on blurred frames and unseen defects\n', options: { bullet: true } },
      { text: 'Critical zones matter: A scuff on a case is cosmetic; a bent lead shorts the board\n', options: { bullet: true } },
      { text: 'Why now: Edge AI inference now enables sub-50ms closed-loop decisions on lines', options: { bullet: true } }
    ], {
      x: 7.1, y: 3.0, w: 5.3, h: 3.5,
      fontSize: 18, fontFace: FONTS.BODY, color: COLORS.TEXT_DARK, lineSpacing: 26
    });

    slide.addNotes('Manufacturing visual inspection is broken because traditional computer vision treats quality as a binary classification problem. QualityIQ bridges the gap between raw perceptual evidence and operational decision-making, accounting for optical reality and defect criticality.');
  }

  // ==========================================
  // SLIDE 3: 02 · THE PLAN | PROPOSED SOLUTION
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.BG_LIGHT };
    addHeaderBranding(slide, '02', 'THE PLAN', 'PROPOSED SOLUTION');
    addFooter(slide);

    // Left Card: OUR IDEA
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.6, y: 2.15, w: 5.8, h: 4.6,
      fill: { color: COLORS.CARD_LIGHT },
      line: { color: COLORS.CARD_LIGHT_BORDER, width: 1 },
      rectRadius: 0.08
    });
    slide.addText('OUR IDEA', {
      x: 0.9, y: 2.4, w: 5.2, h: 0.4,
      fontSize: 16, fontFace: FONTS.HEADING, bold: true, color: COLORS.RED_PRIMARY
    });
    slide.addText([
      { text: '3-layer architecture: Perception -> Decision Engine -> Quality Intelligence\n', options: { bullet: true } },
      { text: 'Classical optical Quality Gate filters blur, glare, and exposure before inference\n', options: { bullet: true } },
      { text: 'Automated multi-camera Recovery Loop re-inspects flawed frames before decision\n', options: { bullet: true } },
      { text: 'Calibrated 4-state verdict: PASS, REJECT, REVIEW, and UNINSPECTABLE', options: { bullet: true } }
    ], {
      x: 0.9, y: 3.0, w: 5.2, h: 3.5,
      fontSize: 18, fontFace: FONTS.BODY, color: COLORS.TEXT_DARK, lineSpacing: 26
    });

    // Right Card: Native Diagram Container
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.7, y: 2.15, w: 6.0, h: 4.6,
      fill: { color: COLORS.CARD_LIGHT },
      line: { color: COLORS.CARD_LIGHT_BORDER, width: 1 },
      rectRadius: 0.08
    });
    slide.addText('THREE LAYERS, ONE CLOSED LOOP', {
      x: 7.0, y: 2.35, w: 5.4, h: 0.35,
      fontSize: 13, fontFace: FONTS.HEADING, bold: true, color: COLORS.TEXT_DARK
    });

    // Layer 1: Perception
    slide.addShape(pres.ShapeType.roundRect, {
      x: 7.0, y: 2.8, w: 5.4, h: 0.9,
      fill: { color: 'F1F5F9' }, line: { color: 'CBD5E1', width: 1 }, rectRadius: 0.06
    });
    slide.addText('1. PERCEPTION LAYER', { x: 7.2, y: 2.9, w: 5.0, h: 0.25, fontSize: 11, bold: true, color: COLORS.BLUE_ACCENT });
    slide.addText('OpenCV Quality Gate (Blur/Glare) · PatchCore Anomaly Heatmap · Defect Typer', {
      x: 7.2, y: 3.15, w: 5.0, h: 0.45, fontSize: 10, color: COLORS.TEXT_DARK
    });

    // Layer 2: Decision
    slide.addShape(pres.ShapeType.roundRect, {
      x: 7.0, y: 3.9, w: 5.4, h: 0.9,
      fill: { color: 'FEF2F2' }, line: { color: 'FECACA', width: 1 }, rectRadius: 0.06
    });
    slide.addText('2. DECISION LAYER', { x: 7.2, y: 4.0, w: 5.0, h: 0.25, fontSize: 11, bold: true, color: COLORS.RED_PRIMARY });
    slide.addText('Profile Rules · Safety-Critical Zones · Severity Multiplier · Multi-Camera Recovery', {
      x: 7.2, y: 4.25, w: 5.0, h: 0.45, fontSize: 10, color: COLORS.TEXT_DARK
    });

    // Layer 3: Intelligence
    slide.addShape(pres.ShapeType.roundRect, {
      x: 7.0, y: 5.0, w: 5.4, h: 0.85,
      fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', width: 1 }, rectRadius: 0.06
    });
    slide.addText('3. INTELLIGENCE & ACTION LAYER', { x: 7.2, y: 5.1, w: 5.0, h: 0.25, fontSize: 11, bold: true, color: COLORS.TEXT_DARK });
    slide.addText('CUSUM Early Warning · Contributing-Factor Lift · Retraining Candidate Pool', {
      x: 7.2, y: 5.35, w: 5.0, h: 0.4, fontSize: 10, color: COLORS.TEXT_MUTED
    });

    // 4 Verdict Badges
    const verdictY = 6.05;
    const vW = 1.25;
    slide.addShape(pres.ShapeType.roundRect, { x: 7.0, y: verdictY, w: vW, h: 0.45, fill: { color: 'DCFCE7' }, line: { color: COLORS.PASS_GREEN, width: 1 }, rectRadius: 0.04 });
    slide.addText('PASS', { x: 7.0, y: verdictY + 0.08, w: vW, h: 0.3, fontSize: 11, bold: true, align: 'center', color: COLORS.PASS_GREEN });

    slide.addShape(pres.ShapeType.roundRect, { x: 8.38, y: verdictY, w: vW, h: 0.45, fill: { color: 'FEE2E2' }, line: { color: COLORS.REJECT_RED, width: 1 }, rectRadius: 0.04 });
    slide.addText('REJECT', { x: 8.38, y: verdictY + 0.08, w: vW, h: 0.3, fontSize: 11, bold: true, align: 'center', color: COLORS.REJECT_RED });

    slide.addShape(pres.ShapeType.roundRect, { x: 9.76, y: verdictY, w: vW, h: 0.45, fill: { color: 'FEF3C7' }, line: { color: COLORS.REVIEW_AMBER, width: 1 }, rectRadius: 0.04 });
    slide.addText('REVIEW', { x: 9.76, y: verdictY + 0.08, w: vW, h: 0.3, fontSize: 11, bold: true, align: 'center', color: COLORS.REVIEW_AMBER });

    slide.addShape(pres.ShapeType.roundRect, { x: 11.14, y: verdictY, w: vW, h: 0.45, fill: { color: 'F1F5F9' }, line: { color: COLORS.UNINSPECT_SLATE, width: 1 }, rectRadius: 0.04 });
    slide.addText('UNINSPECT', { x: 11.14, y: verdictY + 0.08, w: vW, h: 0.3, fontSize: 10, bold: true, align: 'center', color: COLORS.UNINSPECT_SLATE });

    slide.addNotes('Instead of a simple camera-to-dashboard pipeline, QualityIQ implements a closed-loop decision system. It guards model input with a classical quality gate, scores anomalies with PatchCore, and routes outputs to four distinct actions.');
  }

  // ==========================================
  // SLIDE 4: 03 · THE ARSENAL | KEY FEATURES / FUNCTIONALITY
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.BG_LIGHT };
    addHeaderBranding(slide, '03', 'THE ARSENAL', 'KEY FEATURES / FUNCTIONALITY');
    addFooter(slide);

    const fCardW = 5.9;
    const fCardH = 2.2;
    const fRow1Y = 2.15;
    const fRow2Y = 4.55;

    // Feature 01
    slide.addShape(pres.ShapeType.roundRect, { x: 0.6, y: fRow1Y, w: fCardW, h: fCardH, fill: { color: COLORS.CARD_LIGHT }, line: { color: COLORS.CARD_LIGHT_BORDER, width: 1 }, rectRadius: 0.08 });
    slide.addText('01', { x: 0.9, y: fRow1Y + 0.2, w: 0.7, h: 0.4, fontSize: 22, bold: true, color: COLORS.RED_PRIMARY, fontFace: FONTS.HEADING });
    slide.addText('Quality Gate & Recovery Loop', { x: 1.6, y: fRow1Y + 0.22, w: 4.6, h: 0.4, fontSize: 16, bold: true, color: COLORS.TEXT_DARK, fontFace: FONTS.HEADING });
    slide.addText('Pre-inference OpenCV validation checks blur, glare, and exposure. Automatically engages CAM-02/03 adaptive optical recovery before failing.', {
      x: 0.9, y: fRow1Y + 0.75, w: 5.3, h: 1.25, fontSize: 18, color: COLORS.TEXT_DARK, fontFace: FONTS.BODY, lineSpacing: 25
    });

    // Feature 02
    slide.addShape(pres.ShapeType.roundRect, { x: 6.8, y: fRow1Y, w: fCardW, h: fCardH, fill: { color: COLORS.CARD_LIGHT }, line: { color: COLORS.CARD_LIGHT_BORDER, width: 1 }, rectRadius: 0.08 });
    slide.addText('02', { x: 7.1, y: fRow1Y + 0.2, w: 0.7, h: 0.4, fontSize: 22, bold: true, color: COLORS.RED_PRIMARY, fontFace: FONTS.HEADING });
    slide.addText('Four-State Decision Engine', { x: 7.8, y: fRow1Y + 0.22, w: 4.6, h: 0.4, fontSize: 16, bold: true, color: COLORS.TEXT_DARK, fontFace: FONTS.HEADING });
    slide.addText('Replaces binary pass/fail with PASS, REJECT, REVIEW, and UNINSPECTABLE. Evaluates safety-critical zones to escalate severity accurately.', {
      x: 7.1, y: fRow1Y + 0.75, w: 5.3, h: 1.25, fontSize: 18, color: COLORS.TEXT_DARK, fontFace: FONTS.BODY, lineSpacing: 25
    });

    // Feature 03
    slide.addShape(pres.ShapeType.roundRect, { x: 0.6, y: fRow2Y, w: fCardW, h: fCardH, fill: { color: COLORS.CARD_LIGHT }, line: { color: COLORS.CARD_LIGHT_BORDER, width: 1 }, rectRadius: 0.08 });
    slide.addText('03', { x: 0.9, y: fRow2Y + 0.2, w: 0.7, h: 0.4, fontSize: 22, bold: true, color: COLORS.RED_PRIMARY, fontFace: FONTS.HEADING });
    slide.addText('PatchCore Multi-Defect Vision', { x: 1.6, y: fRow2Y + 0.22, w: 4.6, h: 0.4, fontSize: 16, bold: true, color: COLORS.TEXT_DARK, fontFace: FONTS.HEADING });
    slide.addText('Sub-50ms CPU inference using WideResNet-50 memory banks. Generates pixel saliency heatmaps and prototype-based defect classification.', {
      x: 0.9, y: fRow2Y + 0.75, w: 5.3, h: 1.25, fontSize: 18, color: COLORS.TEXT_DARK, fontFace: FONTS.BODY, lineSpacing: 25
    });

    // Feature 04
    slide.addShape(pres.ShapeType.roundRect, { x: 6.8, y: fRow2Y, w: fCardW, h: fCardH, fill: { color: COLORS.CARD_LIGHT }, line: { color: COLORS.CARD_LIGHT_BORDER, width: 1 }, rectRadius: 0.08 });
    slide.addText('04', { x: 7.1, y: fRow2Y + 0.2, w: 0.7, h: 0.4, fontSize: 22, bold: true, color: COLORS.RED_PRIMARY, fontFace: FONTS.HEADING });
    slide.addText('Early Warning & Root-Cause Actions', { x: 7.8, y: fRow2Y + 0.22, w: 4.6, h: 0.4, fontSize: 16, bold: true, color: COLORS.TEXT_DARK, fontFace: FONTS.HEADING });
    slide.addText('Sequential CUSUM change-point tracking detects machine tool wear before scrap limits breach. Computes factor lift across machines and batches.', {
      x: 7.1, y: fRow2Y + 0.75, w: 5.3, h: 1.25, fontSize: 18, color: COLORS.TEXT_DARK, fontFace: FONTS.BODY, lineSpacing: 25
    });

    slide.addNotes('Our four flagship capabilities map directly to real factory failure modes. From filtering blurry frames before they hit the model, to providing statistical root-cause advice before entire batches are ruined.');
  }

  // ==========================================
  // SLIDE 5: 04 · THE EXECUTION | HOW THE SOLUTION WILL WORK
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.BG_LIGHT };
    addHeaderBranding(slide, '04', 'THE EXECUTION', 'HOW THE SOLUTION WILL WORK');
    addFooter(slide);

    // 4 Top Step Boxes
    const sW = 2.85;
    const sH = 1.35;
    const sY = 2.15;
    const sGap = 0.24;

    const steps = [
      { num: 'STEP 1', title: 'Capture Image', desc: 'High-speed optical sensor capture on moving conveyor line' },
      { num: 'STEP 2', title: 'Quality Gate', desc: 'Laplacian variance & exposure check filters bad frames' },
      { num: 'STEP 3', title: 'Vision & Decision', desc: 'PatchCore anomaly scoring + critical-zone severity logic' },
      { num: 'STEP 4', title: 'Verdict & Action', desc: '4-state verdict triggers pneumatic pusher or QC buffer' }
    ];

    steps.forEach((st, i) => {
      const sX = 0.6 + i * (sW + sGap);
      slide.addShape(pres.ShapeType.roundRect, {
        x: sX, y: sY, w: sW, h: sH,
        fill: { color: COLORS.CARD_DARK },
        rectRadius: 0.06
      });
      slide.addText(st.num, { x: sX + 0.2, y: sY + 0.15, w: sW - 0.4, h: 0.25, fontSize: 10, bold: true, color: COLORS.RED_ACCENT });
      slide.addText(st.title, { x: sX + 0.2, y: sY + 0.42, w: sW - 0.4, h: 0.3, fontSize: 12, bold: true, color: COLORS.TEXT_LIGHT });
      slide.addText(st.desc, { x: sX + 0.2, y: sY + 0.75, w: sW - 0.4, h: 0.5, fontSize: 9.5, color: COLORS.TEXT_LIGHT_MUTED });
    });

    // Flowchart Diagram Box
    const dY = 3.75;
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.6, y: dY, w: 12.13, h: 3.0,
      fill: { color: COLORS.CARD_LIGHT },
      line: { color: COLORS.CARD_LIGHT_BORDER, width: 1 },
      rectRadius: 0.08
    });

    slide.addText('END-TO-END PIPELINE & ADAPTIVE RECOVERY ARCHITECTURE', {
      x: 0.9, y: dY + 0.2, w: 11.5, h: 0.3, fontSize: 12, bold: true, color: COLORS.RED_PRIMARY, fontFace: FONTS.HEADING
    });

    // Diagram Nodes
    const nY = dY + 0.7;
    // Node 1: Workpiece
    slide.addShape(pres.ShapeType.roundRect, { x: 0.9, y: nY, w: 1.8, h: 0.8, fill: { color: 'F1F5F9' }, line: { color: '94A3B8', width: 1 } });
    slide.addText('Conveyor Ingestion\nTrigger Sensor', { x: 0.9, y: nY + 0.15, w: 1.8, h: 0.5, fontSize: 10, align: 'center', bold: true });

    // Arrow 1
    slide.addText('->', { x: 2.75, y: nY + 0.25, w: 0.4, h: 0.3, fontSize: 14, align: 'center', bold: true, color: COLORS.TEXT_MUTED });

    // Node 2: Quality Gate
    slide.addShape(pres.ShapeType.diamond, { x: 3.2, y: nY - 0.1, w: 1.8, h: 1.0, fill: { color: 'FEF3C7' }, line: { color: COLORS.REVIEW_AMBER, width: 1 } });
    slide.addText('Quality Gate\nPass?', { x: 3.2, y: nY + 0.18, w: 1.8, h: 0.5, fontSize: 9.5, align: 'center', bold: true, color: COLORS.TEXT_DARK });

    // Arrow 2: Unreliable (Up to Recovery)
    slide.addText('Unreliable', { x: 3.4, y: dY + 1.8, w: 1.4, h: 0.25, fontSize: 8.5, color: COLORS.RED_PRIMARY, bold: true, align: 'center' });
    slide.addShape(pres.ShapeType.roundRect, { x: 2.9, y: dY + 2.05, w: 2.4, h: 0.75, fill: { color: 'FEE2E2' }, line: { color: COLORS.RED_PRIMARY, width: 1 } });
    slide.addText('Adaptive Recovery Loop\nCAM-02/03 Re-inspect (Max 2x)', { x: 2.9, y: dY + 2.15, w: 2.4, h: 0.55, fontSize: 9, align: 'center', bold: true, color: COLORS.RED_PRIMARY });

    // Arrow 3: Reliable
    slide.addText('Passed', { x: 5.05, y: nY + 0.15, w: 0.6, h: 0.25, fontSize: 8.5, color: COLORS.PASS_GREEN, bold: true });

    // Node 3: PatchCore
    slide.addShape(pres.ShapeType.roundRect, { x: 5.6, y: nY, w: 2.0, h: 0.8, fill: { color: 'DBEAFE' }, line: { color: COLORS.BLUE_ACCENT, width: 1 } });
    slide.addText('PatchCore Inference\nMemory Bank (kNN)', { x: 5.6, y: nY + 0.15, w: 2.0, h: 0.5, fontSize: 10, align: 'center', bold: true, color: COLORS.BLUE_ACCENT });

    // Arrow 4
    slide.addText('->', { x: 7.65, y: nY + 0.25, w: 0.4, h: 0.3, fontSize: 14, align: 'center', bold: true, color: COLORS.TEXT_MUTED });

    // Node 4: Decision Engine
    slide.addShape(pres.ShapeType.roundRect, { x: 8.1, y: nY, w: 2.0, h: 0.8, fill: { color: 'FEF2F2' }, line: { color: COLORS.RED_PRIMARY, width: 1 } });
    slide.addText('Decision Engine\nRules & Critical Zones', { x: 8.1, y: nY + 0.15, w: 2.0, h: 0.5, fontSize: 10, align: 'center', bold: true, color: COLORS.RED_PRIMARY });

    // Arrow 5
    slide.addText('->', { x: 10.15, y: nY + 0.25, w: 0.4, h: 0.3, fontSize: 14, align: 'center', bold: true, color: COLORS.TEXT_MUTED });

    // Node 5: Physical Actuator
    slide.addShape(pres.ShapeType.roundRect, { x: 10.6, y: nY, w: 1.8, h: 0.8, fill: { color: 'DCFCE7' }, line: { color: COLORS.PASS_GREEN, width: 1 } });
    slide.addText('Pneumatic Ejector\n<120ms Action', { x: 10.6, y: nY + 0.15, w: 1.8, h: 0.5, fontSize: 10, align: 'center', bold: true, color: COLORS.PASS_GREEN });

    // Bottom telemetry bar inside diagram
    slide.addText('Telemetry Feedback Loop: All serialized records feed CUSUM change-point tracking & retraining candidate buffer.', {
      x: 5.6, y: dY + 2.2, w: 6.8, h: 0.5, fontSize: 10, fontFace: FONTS.BODY, italic: true, color: COLORS.TEXT_MUTED
    });

    slide.addNotes('This execution architecture handles physical conveyor realities. When an image is degraded, our adaptive recovery loop intercepts it immediately rather than producing a false reject. Decisions travel directly to physical actuators.');
  }

  // ==========================================
  // SLIDE 6: 05 · THE GEAR | TECHNOLOGY / TECH STACK
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.BG_LIGHT };
    addHeaderBranding(slide, '05', 'THE GEAR', 'TECHNOLOGY / TECH STACK');
    addFooter(slide);

    const tableData = [
      [
        { text: 'Layer', options: { bold: true, fill: COLORS.CARD_DARK, color: COLORS.TEXT_LIGHT, fontFace: FONTS.HEADING, fontSize: 11 } },
        { text: 'Technology', options: { bold: true, fill: COLORS.CARD_DARK, color: COLORS.TEXT_LIGHT, fontFace: FONTS.HEADING, fontSize: 11 } },
        { text: 'Why we chose it', options: { bold: true, fill: COLORS.CARD_DARK, color: COLORS.TEXT_LIGHT, fontFace: FONTS.HEADING, fontSize: 11 } }
      ],
      [
        { text: 'Frontend', options: { bold: true, fontFace: FONTS.HEADING, fontSize: 11 } },
        { text: 'Next.js, TypeScript, Tailwind CSS', options: { fontSize: 11, fontFace: FONTS.BODY } },
        { text: 'High-performance enterprise dashboard with 8px rhythm and tabular figures', options: { fontSize: 10.5, fontFace: FONTS.BODY } }
      ],
      [
        { text: 'Backend', options: { bold: true, fontFace: FONTS.HEADING, fontSize: 11 } },
        { text: 'Python 3.11, FastAPI, Pydantic v2', options: { fontSize: 11, fontFace: FONTS.BODY } },
        { text: 'Sub-millisecond async REST API and real-time Server-Sent Events (SSE) streaming', options: { fontSize: 10.5, fontFace: FONTS.BODY } }
      ],
      [
        { text: 'Database', options: { bold: true, fontFace: FONTS.HEADING, fontSize: 11 } },
        { text: 'PostgreSQL, SQLAlchemy, JSON Store', options: { fontSize: 11, fontFace: FONTS.BODY } },
        { text: 'Immutable audit logs, serialized inspection records, and shift telemetry', options: { fontSize: 10.5, fontFace: FONTS.BODY } }
      ],
      [
        { text: 'AI / CV', options: { bold: true, fontFace: FONTS.HEADING, fontSize: 11 } },
        { text: 'PyTorch, ONNX Runtime, OpenCV', options: { fontSize: 11, fontFace: FONTS.BODY } },
        { text: 'PatchCore memory banks, 40ms CPU inference, MVTec AD benchmark dataset*', options: { fontSize: 10.5, fontFace: FONTS.BODY } }
      ],
      [
        { text: 'Hosting', options: { bold: true, fontFace: FONTS.HEADING, fontSize: 11 } },
        { text: 'Docker Compose, Nginx Reverse Proxy', options: { fontSize: 11, fontFace: FONTS.BODY } },
        { text: 'One-command production deployment, isolated networking, and edge gateway', options: { fontSize: 10.5, fontFace: FONTS.BODY } }
      ],
      [
        { text: 'Tooling', options: { bold: true, fontFace: FONTS.HEADING, fontSize: 11 } },
        { text: 'Git, pytest, GitHub Actions, Alembic', options: { fontSize: 11, fontFace: FONTS.BODY } },
        { text: 'Deterministic regression testing, CI/CD validation, and schema migrations', options: { fontSize: 10.5, fontFace: FONTS.BODY } }
      ]
    ];

    slide.addTable(tableData, {
      x: 0.6,
      y: 2.15,
      w: 12.13,
      colW: [1.8, 3.8, 6.53],
      rowH: 0.55,
      border: { pt: 1, color: COLORS.CARD_LIGHT_BORDER },
      fill: COLORS.CARD_LIGHT
    });

    slide.addText('*Dataset Credit: MVTec AD (MVTec Software GmbH) used under non-commercial research licence. Covers transistor and metal_nut inspection categories.', {
      x: 0.6,
      y: 6.4,
      w: 12.13,
      h: 0.35,
      fontSize: 10,
      fontFace: FONTS.BODY,
      italic: true,
      color: COLORS.TEXT_MUTED
    });

    slide.addNotes('Our tech stack prioritizes low-latency edge determinism. Exporting PyTorch backbones to ONNX Runtime allows 40ms CPU execution directly on industrial PCs without requiring expensive server-grade GPUs.');
  }

  // ==========================================
  // SLIDE 7: 06 · INSIDE THE MINT | CURRENT PROGRESS / WORK DONE
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.BG_LIGHT };
    addHeaderBranding(slide, '06', 'INSIDE THE MINT', 'CURRENT PROGRESS / WORK DONE');
    addFooter(slide);

    // Left Card: COMPLETED
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.6, y: 2.15, w: 3.8, h: 4.6,
      fill: { color: COLORS.CARD_LIGHT }, line: { color: COLORS.CARD_LIGHT_BORDER, width: 1 }, rectRadius: 0.08
    });
    slide.addText('COMPLETED', {
      x: 0.85, y: 2.4, w: 3.3, h: 0.35,
      fontSize: 16, fontFace: FONTS.HEADING, bold: true, color: COLORS.RED_PRIMARY
    });
    slide.addText([
      { text: '15 industrial failure modes scoped and mapped to rules\n', options: { bullet: true } },
      { text: 'Complete 3-layer architecture & 4-state verdict designed\n', options: { bullet: true } },
      { text: 'Inspection profiles for transistor & metal_nut created\n', options: { bullet: true } },
      { text: 'UI/UX design specification & REST/SSE API contract defined', options: { bullet: true } }
    ], {
      x: 0.85, y: 2.95, w: 3.3, h: 3.6,
      fontSize: 18, fontFace: FONTS.BODY, color: COLORS.TEXT_DARK, lineSpacing: 25
    });

    // Middle Card: IN PROGRESS
    slide.addShape(pres.ShapeType.roundRect, {
      x: 4.7, y: 2.15, w: 3.8, h: 4.6,
      fill: { color: COLORS.CARD_LIGHT }, line: { color: COLORS.CARD_LIGHT_BORDER, width: 1 }, rectRadius: 0.08
    });
    slide.addText('IN PROGRESS', {
      x: 4.95, y: 2.4, w: 3.3, h: 0.35,
      fontSize: 16, fontFace: FONTS.HEADING, bold: true, color: COLORS.RED_PRIMARY
    });
    slide.addText([
      { text: 'PatchCore memory bank training & tuning on MVTec AD\n', options: { bullet: true } },
      { text: 'Interactive 6-page dashboard & conveyor simulation build\n', options: { bullet: true } },
      { text: 'Unit tests for quality gate, decision logic, and CUSUM\n', options: { bullet: true } },
      { text: 'Docker Compose multi-container deployment packaging', options: { bullet: true } }
    ], {
      x: 4.95, y: 2.95, w: 3.3, h: 3.6,
      fontSize: 18, fontFace: FONTS.BODY, color: COLORS.TEXT_DARK, lineSpacing: 25
    });

    // Right Card: Design Mock-up
    slide.addShape(pres.ShapeType.roundRect, {
      x: 8.8, y: 2.15, w: 3.93, h: 4.6,
      fill: { color: COLORS.CARD_LIGHT }, line: { color: COLORS.CARD_LIGHT_BORDER, width: 1 }, rectRadius: 0.08
    });
    slide.addText('PROTOTYPE PREVIEW', {
      x: 9.05, y: 2.4, w: 3.4, h: 0.35,
      fontSize: 14, fontFace: FONTS.HEADING, bold: true, color: COLORS.TEXT_DARK
    });

    // Mini UI mockup built from native PowerPoint shapes
    slide.addShape(pres.ShapeType.roundRect, {
      x: 9.05, y: 2.85, w: 3.43, h: 3.4,
      fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', width: 1 }, rectRadius: 0.06
    });

    // Mini UI Header
    slide.addShape(pres.ShapeType.rect, { x: 9.05, y: 2.85, w: 3.43, h: 0.45, fill: { color: '0F172A' } });
    slide.addText('QualityIQ · Live Production View', { x: 9.2, y: 2.92, w: 3.1, h: 0.3, fontSize: 9, bold: true, color: '#FFFFFF' });

    // Mini UI KPI tiles
    slide.addShape(pres.ShapeType.roundRect, { x: 9.2, y: 3.45, w: 1.5, h: 0.7, fill: { color: '#FFFFFF' }, line: { color: '#E2E8F0', width: 1 } });
    slide.addText('First-Pass Yield\n96.2%', { x: 9.25, y: 3.5, w: 1.4, h: 0.6, fontSize: 8.5, bold: true, color: COLORS.PASS_GREEN });

    slide.addShape(pres.ShapeType.roundRect, { x: 10.85, y: 3.45, w: 1.5, h: 0.7, fill: { color: '#FFFFFF' }, line: { color: '#E2E8F0', width: 1 } });
    slide.addText('In-Line Latency\n41.5 ms', { x: 10.9, y: 3.5, w: 1.4, h: 0.6, fontSize: 8.5, bold: true, color: COLORS.BLUE_ACCENT });

    // Mini UI Viewport
    slide.addShape(pres.ShapeType.rect, { x: 9.2, y: 4.3, w: 3.15, h: 1.3, fill: { color: '#090D16' } });
    slide.addText('CAM-01 TELECENTRIC INGESTION\n[Heatmap: Defect Bounding Box]', { x: 9.2, y: 4.7, w: 3.15, h: 0.5, fontSize: 8.5, align: 'center', color: '#94A3B8' });

    // Mini UI Verdict bar
    slide.addShape(pres.ShapeType.roundRect, { x: 9.2, y: 5.75, w: 3.15, h: 0.35, fill: { color: '#FEE2E2' }, line: { color: COLORS.REJECT_RED, width: 1 } });
    slide.addText('VERDICT: REJECT (Bent Lead in Z1)', { x: 9.2, y: 5.8, w: 3.15, h: 0.25, fontSize: 8.5, bold: true, align: 'center', color: COLORS.REJECT_RED });

    slide.addText('Design mock-up (live build in progress)', {
      x: 9.05, y: 6.35, w: 3.43, h: 0.3, fontSize: 9, italic: true, align: 'center', color: COLORS.TEXT_MUTED
    });

    slide.addNotes('We are strictly honest about our current progress: the architecture, rules, and interface specifications are complete, while model training and full API wiring are actively being built during the hackathon.');
  }

  // ==========================================
  // SLIDE 8: 07 · THE GETAWAY | FUTURE PLAN / NEXT STEPS
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.BG_LIGHT };
    addHeaderBranding(slide, '07', 'THE GETAWAY', 'FUTURE PLAN / NEXT STEPS');
    addFooter(slide);

    const planW = 3.8;
    const planH = 4.6;

    // Phase 1
    slide.addShape(pres.ShapeType.roundRect, { x: 0.6, y: 2.15, w: planW, h: planH, fill: { color: COLORS.CARD_LIGHT }, line: { color: COLORS.CARD_LIGHT_BORDER, width: 1 }, rectRadius: 0.08 });
    slide.addText('PHASE 1', { x: 0.85, y: 2.35, w: 3.3, h: 0.25, fontSize: 11, bold: true, color: COLORS.RED_PRIMARY, fontFace: FONTS.HEADING });
    slide.addText('DURING THE HACKATHON', { x: 0.85, y: 2.65, w: 3.3, h: 0.4, fontSize: 15, bold: true, color: COLORS.TEXT_DARK, fontFace: FONTS.HEADING });
    slide.addText([
      { text: 'Train PatchCore memory banks on transistor and metal_nut\n', options: { bullet: true } },
      { text: 'Deliver full interactive 6-page dashboard with fault injection\n', options: { bullet: true } },
      { text: 'Complete test suite and verify end-to-end Docker Compose stack', options: { bullet: true } }
    ], {
      x: 0.85, y: 3.2, w: 3.3, h: 3.3,
      fontSize: 18, fontFace: FONTS.BODY, color: COLORS.TEXT_DARK, lineSpacing: 26
    });

    // Phase 2
    slide.addShape(pres.ShapeType.roundRect, { x: 4.7, y: 2.15, w: planW, h: planH, fill: { color: COLORS.CARD_LIGHT }, line: { color: COLORS.CARD_LIGHT_BORDER, width: 1 }, rectRadius: 0.08 });
    slide.addText('PHASE 2', { x: 4.95, y: 2.35, w: 3.3, h: 0.25, fontSize: 11, bold: true, color: COLORS.RED_PRIMARY, fontFace: FONTS.HEADING });
    slide.addText('RIGHT AFTER', { x: 4.95, y: 2.65, w: 3.3, h: 0.4, fontSize: 15, bold: true, color: COLORS.TEXT_DARK, fontFace: FONTS.HEADING });
    slide.addText([
      { text: 'Pilot testing with real factory conveyor image streams\n', options: { bullet: true } },
      { text: 'Expand product catalog to cable, zipper, and food packaging\n', options: { bullet: true } },
      { text: 'Direct hardware integration with Basler GigE cameras and PLCs', options: { bullet: true } }
    ], {
      x: 4.95, y: 3.2, w: 3.3, h: 3.3,
      fontSize: 18, fontFace: FONTS.BODY, color: COLORS.TEXT_DARK, lineSpacing: 26
    });

    // Phase 3
    slide.addShape(pres.ShapeType.roundRect, { x: 8.8, y: 2.15, w: planW, h: planH, fill: { color: COLORS.CARD_LIGHT }, line: { color: COLORS.CARD_LIGHT_BORDER, width: 1 }, rectRadius: 0.08 });
    slide.addText('PHASE 3', { x: 9.05, y: 2.35, w: 3.3, h: 0.25, fontSize: 11, bold: true, color: COLORS.RED_PRIMARY, fontFace: FONTS.HEADING });
    slide.addText('LONG-TERM VISION', { x: 9.05, y: 2.65, w: 3.3, h: 0.4, fontSize: 15, bold: true, color: COLORS.TEXT_DARK, fontFace: FONTS.HEADING });
    slide.addText([
      { text: 'Multi-plant telemetry synchronization and federated learning\n', options: { bullet: true } },
      { text: 'Continuous active learning from operator review overrides\n', options: { bullet: true } },
      { text: 'SaaS and per-inspection-line licensing model for Tier-1 suppliers', options: { bullet: true } }
    ], {
      x: 9.05, y: 3.2, w: 3.3, h: 3.3,
      fontSize: 18, fontFace: FONTS.BODY, color: COLORS.TEXT_DARK, lineSpacing: 26
    });

    slide.addNotes('Our roadmap moves from hackathon proof-of-concept to pilot deployment and multi-plant scaling. In Phase 2, we connect directly to industrial PLCs and expand beyond MVTec AD benchmark categories.');
  }

  // ==========================================
  // SLIDE 9: 08 · THE VAULT | GITHUB REPOSITORY LINK
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.BG_DARK };

    // Header in dark style
    slide.addText('ATMIYA UNIVERSITY · RAJKOT', { x: 0.6, y: 0.35, w: 4.0, h: 0.4, fontSize: 10, bold: true, color: COLORS.TEXT_LIGHT });
    slide.addText('RIT  |  ADSC', { x: 9.8, y: 0.35, w: 2.8, h: 0.4, fontSize: 12, bold: true, align: 'right', color: COLORS.RED_ACCENT });
    slide.addShape(pres.ShapeType.line, { x: 0.6, y: 0.85, w: 12.13, h: 0, line: { color: COLORS.RED_PRIMARY, width: 2 } });
    slide.addText('08 · THE VAULT', { x: 0.6, y: 1.05, w: 6.0, h: 0.3, fontSize: 11, bold: true, color: COLORS.RED_ACCENT });
    slide.addText('GITHUB REPOSITORY LINK', { x: 0.6, y: 1.35, w: 12.0, h: 0.55, fontSize: 24, bold: true, color: COLORS.TEXT_LIGHT });

    // Link Box
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.6, y: 2.1, w: 12.13, h: 1.1,
      fill: { color: COLORS.CARD_DARK },
      line: { color: COLORS.RED_ACCENT, width: 1.5 },
      rectRadius: 0.08
    });
    slide.addText('https://github.com/[username]/[repository]', {
      x: 0.9, y: 2.45, w: 11.5, h: 0.45,
      fontSize: 20, fontFace: 'Courier New', bold: true, color: COLORS.TEXT_LIGHT
    });

    // 4 Checklist Cards
    const vCardW = 2.85;
    const vCardH = 3.1;
    const vY = 3.55;
    const vGap = 0.24;

    const vCards = [
      { tag: 'PUBLIC', desc: 'Repository visibility is set to public with complete open-source reproduction steps.' },
      { tag: 'README', desc: 'Covers setup steps, 15 failure modes, system architecture, decision rules, and team.' },
      { tag: 'COMMITS', desc: 'Regular commits, pull requests, and verified contributions from every team member.' },
      { tag: 'DEMO (OPTIONAL)', desc: '[Live link or demo video link]' }
    ];

    vCards.forEach((c, idx) => {
      const vX = 0.6 + idx * (vCardW + vGap);
      slide.addShape(pres.ShapeType.roundRect, {
        x: vX, y: vY, w: vCardW, h: vCardH,
        fill: { color: COLORS.CARD_DARK },
        line: { color: COLORS.CARD_DARK_BORDER, width: 1 },
        rectRadius: 0.08
      });
      slide.addText(c.tag, { x: vX + 0.25, y: vY + 0.3, w: vCardW - 0.5, h: 0.35, fontSize: 13, bold: true, color: COLORS.RED_ACCENT });
      slide.addText(c.desc, { x: vX + 0.25, y: vY + 0.8, w: vCardW - 0.5, h: 2.0, fontSize: 13, color: COLORS.TEXT_LIGHT_MUTED, lineSpacing: 20 });
    });

    slide.addText('Code Carnival 3.0 · ADSC, Atmiya University', { x: 0.6, y: 7.0, w: 6.0, h: 0.3, fontSize: 9, color: COLORS.TEXT_MUTED });
    slide.addText('[TEAM NAME]', { x: 10.0, y: 7.0, w: 2.7, h: 0.3, fontSize: 10, bold: true, align: 'right', color: COLORS.RED_ACCENT });

    slide.addNotes('Our repository contains complete reproduction steps, Docker compose scripts, evaluation benchmarks, and full open-source documentation.');
  }

  const outputPath = path.join(__dirname, '..', 'QualityIQ_CC3_Idea_Submission.pptx');
  await pres.writeFile({ fileName: outputPath });
  console.log(`[✓] PPTX successfully generated: ${outputPath}`);
}

async function generatePDF() {
  const outputPath = path.join(__dirname, '..', 'QualityIQ_CC3_Idea_Submission.pdf');
  const doc = new PDFDocument({
    size: [960, 540], // 16:9 widescreen in points (13.33 x 7.5 inches)
    margin: 0
  });

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  const C = {
    BG_DARK: '#111215',
    BG_LIGHT: '#FAF7F2',
    CARD_DARK: '#1A1C20',
    CARD_DARK_BORDER: '#2A2D34',
    CARD_LIGHT: '#FFFFFF',
    CARD_LIGHT_BORDER: '#E5E0D8',
    RED_PRIMARY: '#C62828',
    RED_ACCENT: '#E53935',
    TEXT_DARK: '#111215',
    TEXT_MUTED: '#666666',
    TEXT_LIGHT: '#FFFFFF',
    TEXT_LIGHT_MUTED: '#D0D0D0'
  };

  function drawHeader(pageNum, sectionKicker, title) {
    doc.fillColor(C.TEXT_DARK).fontSize(10).font('Helvetica-Bold').text('ATMIYA UNIVERSITY', 45, 25);
    doc.fillColor(C.TEXT_MUTED).fontSize(8).font('Helvetica').text('RAJKOT, GUJARAT (INDIA)', 45, 38);

    doc.fillColor(C.RED_PRIMARY).fontSize(12).font('Helvetica-Bold').text('RIT   |   ADSC', 750, 25, { width: 165, align: 'right' });

    // Red Divider Line
    doc.rect(45, 68, 870, 2).fill(C.RED_PRIMARY);

    // Kicker & Title
    doc.fillColor(C.RED_PRIMARY).fontSize(11).font('Helvetica-Bold').text(`${pageNum} · ${sectionKicker}`, 45, 82);
    doc.fillColor(C.TEXT_DARK).fontSize(22).font('Helvetica-Bold').text(title, 45, 102);
  }

  function drawFooter() {
    doc.fillColor(C.TEXT_MUTED).fontSize(9).font('Helvetica').text('Code Carnival 3.0 · ADSC, Atmiya University', 45, 508);
    doc.fillColor(C.RED_PRIMARY).fontSize(10).font('Helvetica-Bold').text('[TEAM NAME]', 750, 508, { width: 165, align: 'right' });
  }

  // --- SLIDE 1 ---
  doc.rect(0, 0, 960, 540).fill(C.BG_DARK);
  doc.rect(0, 80, 8, 380).fill(C.RED_PRIMARY);

  doc.fillColor(C.TEXT_LIGHT).fontSize(11).font('Helvetica-Bold').text('ATMIYA UNIVERSITY · RAJKOT', 55, 35);
  doc.fillColor(C.RED_ACCENT).fontSize(12).font('Helvetica-Bold').text('RIT  |  ADSC', 750, 35, { width: 155, align: 'right' });

  doc.fillColor(C.RED_ACCENT).fontSize(11).font('Helvetica-Bold').text('ATMIYA DEVELOPER STUDENTS CLUB PRESENTS', 55, 120);
  doc.fillColor(C.TEXT_LIGHT).fontSize(48).font('Helvetica-Bold').text('CODE CARNIVAL 3.0', 55, 145);
  doc.fillColor(C.TEXT_LIGHT_MUTED).fontSize(14).font('Helvetica').text('QualityIQ: Adaptive Industrial Quality Intelligence Platform', 55, 225);
  doc.fillColor('#A0AEC0').fontSize(11).font('Helvetica-Oblique').text('"Don\'t just detect defects. Decide quality, recover from bad inspections, and explain what is happening on the line."', 55, 250);

  // 5 cards on title slide
  const tCards = [
    { label: 'TEAM NAME', val: '[Your team name]', x: 55, y: 310, w: 260 },
    { label: 'TEAM ID', val: '[ID from the ADSC portal]', x: 335, y: 310, w: 260 },
    { label: 'TEAM LEADER', val: '[Full name]', x: 615, y: 310, w: 290 },
    { label: 'PROBLEM STATEMENT TITLE', val: 'Industrial Visual Quality Inspection with AI', x: 55, y: 400, w: 540 },
    { label: 'THEME / TRACK', val: 'AI and Computer Vision / Smart Manufacturing', x: 615, y: 400, w: 290 }
  ];
  tCards.forEach(c => {
    doc.roundedRect(c.x, c.y, c.w, 70, 6).fillAndStroke(C.CARD_DARK, C.CARD_DARK_BORDER);
    doc.fillColor(C.RED_ACCENT).fontSize(9).font('Helvetica-Bold').text(c.label, c.x + 15, c.y + 12);
    doc.fillColor(C.TEXT_LIGHT).fontSize(12).font('Helvetica-Bold').text(c.val, c.x + 15, c.y + 34);
  });

  // --- SLIDE 2 ---
  doc.addPage();
  doc.rect(0, 0, 960, 540).fill(C.BG_LIGHT);
  drawHeader('01', 'THE TARGET', 'PROBLEM STATEMENT & UNDERSTANDING');
  drawFooter();

  // Left card
  doc.roundedRect(45, 145, 415, 340, 8).fillAndStroke(C.CARD_LIGHT, C.CARD_LIGHT_BORDER);
  doc.fillColor(C.RED_PRIMARY).fontSize(15).font('Helvetica-Bold').text('PROBLEM STATEMENT', 65, 165);
  const pBullets = [
    'Surface defects, missing parts, and orientation errors bypass manual QC',
    'High line speeds cause severe operator fatigue, missed flaws, and scrap waste',
    'Moving parts, glare, and vibration trigger false rejects in naive AI detectors',
    'Directly impacts manufacturing plant managers, QC inspectors, and assembly lines'
  ];
  let pY = 205;
  pBullets.forEach(b => {
    doc.fillColor(C.TEXT_DARK).fontSize(13).font('Helvetica').text(`•  ${b}`, 65, pY, { width: 375, lineGap: 5 });
    pY += 55;
  });

  // Right card
  doc.roundedRect(495, 145, 420, 340, 8).fillAndStroke(C.CARD_LIGHT, C.CARD_LIGHT_BORDER);
  doc.fillColor(C.RED_PRIMARY).fontSize(15).font('Helvetica-Bold').text('OUR UNDERSTANDING', 515, 165);
  const uBullets = [
    'Root cause: Factory vision needs decisions and recovery, not just raw detection',
    'Existing gap: Binary bounding-box models fail on blurred frames and unseen defects',
    'Critical zones matter: A scuff on a case is cosmetic; a bent lead shorts the board',
    'Why now: Edge AI inference now enables sub-50ms closed-loop decisions on lines'
  ];
  let uY = 205;
  uBullets.forEach(b => {
    doc.fillColor(C.TEXT_DARK).fontSize(13).font('Helvetica').text(`•  ${b}`, 515, uY, { width: 380, lineGap: 5 });
    uY += 55;
  });

  // --- SLIDE 3 ---
  doc.addPage();
  doc.rect(0, 0, 960, 540).fill(C.BG_LIGHT);
  drawHeader('02', 'THE PLAN', 'PROPOSED SOLUTION');
  drawFooter();

  doc.roundedRect(45, 145, 415, 340, 8).fillAndStroke(C.CARD_LIGHT, C.CARD_LIGHT_BORDER);
  doc.fillColor(C.RED_PRIMARY).fontSize(15).font('Helvetica-Bold').text('OUR IDEA', 65, 165);
  const iBullets = [
    '3-layer architecture: Perception -> Decision Engine -> Quality Intelligence',
    'Classical optical Quality Gate filters blur, glare, and exposure before inference',
    'Automated multi-camera Recovery Loop re-inspects flawed frames before decision',
    'Calibrated 4-state verdict: PASS, REJECT, REVIEW, and UNINSPECTABLE'
  ];
  let iY = 205;
  iBullets.forEach(b => {
    doc.fillColor(C.TEXT_DARK).fontSize(13).font('Helvetica').text(`•  ${b}`, 65, iY, { width: 375, lineGap: 5 });
    iY += 55;
  });

  // Right Diagram
  doc.roundedRect(495, 145, 420, 340, 8).fillAndStroke(C.CARD_LIGHT, C.CARD_LIGHT_BORDER);
  doc.fillColor(C.TEXT_DARK).fontSize(14).font('Helvetica-Bold').text('THREE LAYERS, ONE CLOSED LOOP', 515, 165);

  doc.roundedRect(515, 195, 380, 65, 6).fillAndStroke('#F1F5F9', '#CBD5E1');
  doc.fillColor(C.RED_PRIMARY).fontSize(11).font('Helvetica-Bold').text('1. PERCEPTION LAYER', 530, 205);
  doc.fillColor(C.TEXT_DARK).fontSize(10).font('Helvetica').text('OpenCV Quality Gate (Blur/Exposure) · PatchCore Anomaly · Defect Typer', 530, 225);

  doc.roundedRect(515, 275, 380, 65, 6).fillAndStroke('#FEF2F2', '#FECACA');
  doc.fillColor(C.RED_PRIMARY).fontSize(11).font('Helvetica-Bold').text('2. DECISION LAYER', 530, 285);
  doc.fillColor(C.TEXT_DARK).fontSize(10).font('Helvetica').text('Profile Rules · Safety-Critical Zones · Severity Multiplier · Recovery Loop', 530, 305);

  doc.roundedRect(515, 355, 380, 65, 6).fillAndStroke('#F8FAFC', '#CBD5E1');
  doc.fillColor(C.TEXT_DARK).fontSize(11).font('Helvetica-Bold').text('3. INTELLIGENCE & ACTION LAYER', 530, 365);
  doc.fillColor(C.TEXT_MUTED).fontSize(10).font('Helvetica').text('CUSUM Early Warning · Contributing-Factor Lift · Retraining Candidate Pool', 530, 385);

  // Verdict chips
  doc.roundedRect(515, 435, 85, 30, 4).fillAndStroke('#DCFCE7', '#15803D');
  doc.fillColor('#15803D').fontSize(10).font('Helvetica-Bold').text('PASS', 515, 444, { width: 85, align: 'center' });

  doc.roundedRect(610, 435, 85, 30, 4).fillAndStroke('#FEE2E2', '#DC2626');
  doc.fillColor('#DC2626').fontSize(10).font('Helvetica-Bold').text('REJECT', 610, 444, { width: 85, align: 'center' });

  doc.roundedRect(705, 435, 85, 30, 4).fillAndStroke('#FEF3C7', '#D97706');
  doc.fillColor('#D97706').fontSize(10).font('Helvetica-Bold').text('REVIEW', 705, 444, { width: 85, align: 'center' });

  doc.roundedRect(800, 435, 95, 30, 4).fillAndStroke('#F1F5F9', '#475569');
  doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold').text('UNINSPECT', 800, 444, { width: 95, align: 'center' });

  // --- SLIDE 4 ---
  doc.addPage();
  doc.rect(0, 0, 960, 540).fill(C.BG_LIGHT);
  drawHeader('03', 'THE ARSENAL', 'KEY FEATURES / FUNCTIONALITY');
  drawFooter();

  const feats = [
    { num: '01', title: 'Quality Gate & Recovery Loop', desc: 'Pre-inference OpenCV validation checks blur, glare, and exposure. Automatically engages CAM-02/03 adaptive optical recovery before failing.', x: 45, y: 145 },
    { num: '02', title: 'Four-State Decision Engine', desc: 'Replaces binary pass/fail with PASS, REJECT, REVIEW, and UNINSPECTABLE. Evaluates safety-critical zones to escalate severity accurately.', x: 495, y: 145 },
    { num: '03', title: 'PatchCore Multi-Defect Vision', desc: 'Sub-50ms CPU inference using WideResNet-50 memory banks. Generates pixel saliency heatmaps and prototype-based defect classification.', x: 45, y: 320 },
    { num: '04', title: 'Early Warning & Root-Cause Actions', desc: 'Sequential CUSUM change-point tracking detects machine tool wear before scrap limits breach. Computes factor lift across machines and batches.', x: 495, y: 320 }
  ];

  feats.forEach(f => {
    doc.roundedRect(f.x, f.y, 420, 160, 8).fillAndStroke(C.CARD_LIGHT, C.CARD_LIGHT_BORDER);
    doc.fillColor(C.RED_PRIMARY).fontSize(20).font('Helvetica-Bold').text(f.num, f.x + 20, f.y + 18);
    doc.fillColor(C.TEXT_DARK).fontSize(15).font('Helvetica-Bold').text(f.title, f.x + 60, f.y + 22);
    doc.fillColor(C.TEXT_DARK).fontSize(12).font('Helvetica').text(f.desc, f.x + 20, f.y + 58, { width: 380, lineGap: 4 });
  });

  // --- SLIDE 5 ---
  doc.addPage();
  doc.rect(0, 0, 960, 540).fill(C.BG_LIGHT);
  drawHeader('04', 'THE EXECUTION', 'HOW THE SOLUTION WILL WORK');
  drawFooter();

  // Steps
  const stepBoxes = [
    { num: 'STEP 1', t: 'Capture Image', d: 'High-speed optical sensor capture on moving conveyor line', x: 45 },
    { num: 'STEP 2', t: 'Quality Gate', d: 'Laplacian variance & exposure check filters bad frames', x: 270 },
    { num: 'STEP 3', t: 'Vision & Decision', d: 'PatchCore anomaly scoring + critical-zone severity logic', x: 495 },
    { num: 'STEP 4', t: 'Verdict & Action', d: '4-state verdict triggers pneumatic pusher or QC buffer', x: 720 }
  ];

  stepBoxes.forEach(s => {
    doc.roundedRect(s.x, s.t ? 145 : 145, 195, 95, 6).fillAndStroke(C.CARD_DARK, C.CARD_DARK_BORDER);
    doc.fillColor(C.RED_ACCENT).fontSize(9).font('Helvetica-Bold').text(s.num, s.x + 12, 158);
    doc.fillColor(C.TEXT_LIGHT).fontSize(12).font('Helvetica-Bold').text(s.t, s.x + 12, 175);
    doc.fillColor(C.TEXT_LIGHT_MUTED).fontSize(9).font('Helvetica').text(s.d, s.x + 12, 195, { width: 170 });
  });

  // Flowchart
  doc.roundedRect(45, 255, 870, 230, 8).fillAndStroke(C.CARD_LIGHT, C.CARD_LIGHT_BORDER);
  doc.fillColor(C.RED_PRIMARY).fontSize(12).font('Helvetica-Bold').text('END-TO-END PIPELINE & ADAPTIVE RECOVERY ARCHITECTURE', 65, 275);

  doc.roundedRect(75, 320, 130, 60, 6).fillAndStroke('#F1F5F9', '#94A3B8');
  doc.fillColor(C.TEXT_DARK).fontSize(9.5).font('Helvetica-Bold').text('Conveyor Ingestion\nTrigger Sensor', 75, 335, { width: 130, align: 'center' });

  doc.fillColor(C.TEXT_MUTED).fontSize(14).font('Helvetica-Bold').text('->', 215, 342);

  doc.roundedRect(240, 320, 130, 60, 6).fillAndStroke('#FEF3C7', '#D97706');
  doc.fillColor(C.TEXT_DARK).fontSize(9.5).font('Helvetica-Bold').text('Quality Gate\nPass / Fail?', 240, 335, { width: 130, align: 'center' });

  doc.fillColor(C.TEXT_MUTED).fontSize(14).font('Helvetica-Bold').text('->', 380, 342);

  doc.roundedRect(405, 320, 140, 60, 6).fillAndStroke('#DBEAFE', '#1D4ED8');
  doc.fillColor('#1D4ED8').fontSize(9.5).font('Helvetica-Bold').text('PatchCore Inference\nMemory Bank (kNN)', 405, 335, { width: 140, align: 'center' });

  doc.fillColor(C.TEXT_MUTED).fontSize(14).font('Helvetica-Bold').text('->', 555, 342);

  doc.roundedRect(580, 320, 140, 60, 6).fillAndStroke('#FEF2F2', C.RED_PRIMARY);
  doc.fillColor(C.RED_PRIMARY).fontSize(9.5).font('Helvetica-Bold').text('Decision Engine\nRules & Critical Zones', 580, 335, { width: 140, align: 'center' });

  doc.fillColor(C.TEXT_MUTED).fontSize(14).font('Helvetica-Bold').text('->', 730, 342);

  doc.roundedRect(755, 320, 130, 60, 6).fillAndStroke('#DCFCE7', '#15803D');
  doc.fillColor('#15803D').fontSize(9.5).font('Helvetica-Bold').text('Pneumatic Ejector\n<120ms Action', 755, 335, { width: 130, align: 'center' });

  // Recovery branch
  doc.roundedRect(240, 400, 200, 50, 6).fillAndStroke('#FEE2E2', C.RED_PRIMARY);
  doc.fillColor(C.RED_PRIMARY).fontSize(8.5).font('Helvetica-Bold').text('Adaptive Recovery Loop (CAM-02/03)\nExposure / Angle Retry (Max 2x)', 240, 412, { width: 200, align: 'center' });

  doc.fillColor(C.TEXT_MUTED).fontSize(9).font('Helvetica-Oblique').text('Telemetry Loop: All inspection records feed CUSUM early warning and active learning retraining buffer.', 460, 420);

  // --- SLIDE 6 ---
  doc.addPage();
  doc.rect(0, 0, 960, 540).fill(C.BG_LIGHT);
  drawHeader('05', 'THE GEAR', 'TECHNOLOGY / TECH STACK');
  drawFooter();

  const tRows = [
    ['Frontend', 'Next.js, TypeScript, Tailwind CSS', 'High-performance enterprise dashboard with 8px rhythm and tabular figures'],
    ['Backend', 'Python 3.11, FastAPI, Pydantic v2', 'Sub-millisecond async REST API and real-time Server-Sent Events (SSE) streaming'],
    ['Database', 'PostgreSQL, SQLAlchemy, JSON Store', 'Immutable audit logs, serialized inspection records, and shift telemetry'],
    ['AI / CV', 'PyTorch, ONNX Runtime, OpenCV', 'PatchCore memory banks, 40ms CPU inference, MVTec AD benchmark dataset*'],
    ['Hosting', 'Docker Compose, Nginx Reverse Proxy', 'One-command production deployment, isolated networking, and edge gateway'],
    ['Tooling', 'Git, pytest, GitHub Actions, Alembic', 'Deterministic regression testing, CI/CD validation, and schema migrations']
  ];

  // Draw Table Header
  doc.rect(45, 145, 870, 35).fill(C.CARD_DARK);
  doc.fillColor(C.TEXT_LIGHT).fontSize(11).font('Helvetica-Bold').text('Layer', 60, 158);
  doc.fillColor(C.TEXT_LIGHT).fontSize(11).font('Helvetica-Bold').text('Technology', 200, 158);
  doc.fillColor(C.TEXT_LIGHT).fontSize(11).font('Helvetica-Bold').text('Why we chose it', 480, 158);

  let rowY = 180;
  tRows.forEach((r, idx) => {
    doc.rect(45, rowY, 870, 40).fillAndStroke(idx % 2 === 0 ? C.CARD_LIGHT : '#F8FAFC', C.CARD_LIGHT_BORDER);
    doc.fillColor(C.RED_PRIMARY).fontSize(11).font('Helvetica-Bold').text(r[0], 60, rowY + 12);
    doc.fillColor(C.TEXT_DARK).fontSize(10.5).font('Helvetica-Bold').text(r[1], 200, rowY + 12);
    doc.fillColor(C.TEXT_DARK).fontSize(10).font('Helvetica').text(r[2], 480, rowY + 12, { width: 420 });
    rowY += 40;
  });

  doc.fillColor(C.TEXT_MUTED).fontSize(9.5).font('Helvetica-Oblique').text('*Dataset Credit: MVTec AD (MVTec Software GmbH) used under non-commercial research licence. Covers transistor and metal_nut inspection categories.', 45, 455);

  // --- SLIDE 7 ---
  doc.addPage();
  doc.rect(0, 0, 960, 540).fill(C.BG_LIGHT);
  drawHeader('06', 'INSIDE THE MINT', 'CURRENT PROGRESS / WORK DONE');
  drawFooter();

  // Completed
  doc.roundedRect(45, 145, 275, 340, 8).fillAndStroke(C.CARD_LIGHT, C.CARD_LIGHT_BORDER);
  doc.fillColor(C.RED_PRIMARY).fontSize(14).font('Helvetica-Bold').text('COMPLETED', 65, 165);
  const compList = [
    '15 industrial failure modes scoped and mapped to rules',
    'Complete 3-layer architecture & 4-state verdict designed',
    'Inspection profiles for transistor & metal_nut created',
    'UI/UX design specification & REST/SSE API contract defined'
  ];
  let compY = 205;
  compList.forEach(c => {
    doc.fillColor(C.TEXT_DARK).fontSize(11.5).font('Helvetica').text(`•  ${c}`, 65, compY, { width: 235, lineGap: 4 });
    compY += 55;
  });

  // In Progress
  doc.roundedRect(340, 145, 275, 340, 8).fillAndStroke(C.CARD_LIGHT, C.CARD_LIGHT_BORDER);
  doc.fillColor(C.RED_PRIMARY).fontSize(14).font('Helvetica-Bold').text('IN PROGRESS', 360, 165);
  const progList = [
    'PatchCore memory bank training & tuning on MVTec AD',
    'Interactive 6-page dashboard & conveyor simulation build',
    'Unit tests for quality gate, decision logic, and CUSUM',
    'Docker Compose multi-container deployment packaging'
  ];
  let progY = 205;
  progList.forEach(p => {
    doc.fillColor(C.TEXT_DARK).fontSize(11.5).font('Helvetica').text(`•  ${p}`, 360, progY, { width: 235, lineGap: 4 });
    progY += 55;
  });

  // Mock-up Box
  doc.roundedRect(635, 145, 280, 340, 8).fillAndStroke(C.CARD_LIGHT, C.CARD_LIGHT_BORDER);
  doc.fillColor(C.TEXT_DARK).fontSize(13).font('Helvetica-Bold').text('PROTOTYPE PREVIEW', 655, 165);

  doc.roundedRect(655, 195, 240, 245, 6).fillAndStroke('#0F172A', '#334155');
  doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold').text('QualityIQ · Live Production View', 665, 208);

  doc.roundedRect(665, 230, 105, 45, 4).fillAndStroke('#1E293B', '#334155');
  doc.fillColor('#10B981').fontSize(11).font('Helvetica-Bold').text('96.2%', 672, 238);
  doc.fillColor('#94A3B8').fontSize(7.5).font('Helvetica').text('Yield Rate', 672, 256);

  doc.roundedRect(780, 230, 105, 45, 4).fillAndStroke('#1E293B', '#334155');
  doc.fillColor('#38BDF8').fontSize(11).font('Helvetica-Bold').text('41.5 ms', 787, 238);
  doc.fillColor('#94A3B8').fontSize(7.5).font('Helvetica').text('Latency P50', 787, 256);

  doc.roundedRect(665, 285, 220, 85, 4).fillAndStroke('#020617', '#1E293B');
  doc.fillColor('#94A3B8').fontSize(8.5).font('Helvetica').text('CAM-01 TELECENTRIC INGESTION\n[Heatmap Overlay Active]', 665, 320, { width: 220, align: 'center' });

  doc.roundedRect(665, 385, 220, 28, 4).fillAndStroke('#7F1D1D', '#EF4444');
  doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('REJECT: Bent Lead in Zone Z1', 665, 394, { width: 220, align: 'center' });

  doc.fillColor(C.TEXT_MUTED).fontSize(9).font('Helvetica-Oblique').text('Design mock-up (live build in progress)', 655, 455, { width: 240, align: 'center' });

  // --- SLIDE 8 ---
  doc.addPage();
  doc.rect(0, 0, 960, 540).fill(C.BG_LIGHT);
  drawHeader('07', 'THE GETAWAY', 'FUTURE PLAN / NEXT STEPS');
  drawFooter();

  const phases = [
    {
      p: 'PHASE 1', t: 'DURING THE HACKATHON',
      bullets: [
        'Train PatchCore memory banks on transistor and metal_nut',
        'Deliver full interactive 6-page dashboard with fault injection',
        'Complete test suite and verify end-to-end Docker Compose stack'
      ], x: 45
    },
    {
      p: 'PHASE 2', t: 'RIGHT AFTER',
      bullets: [
        'Pilot testing with real factory conveyor image streams',
        'Expand product catalog to cable, zipper, and food packaging',
        'Direct hardware integration with Basler GigE cameras and PLCs'
      ], x: 340
    },
    {
      p: 'PHASE 3', t: 'LONG-TERM VISION',
      bullets: [
        'Multi-plant telemetry synchronization and federated learning',
        'Continuous active learning from operator review overrides',
        'SaaS and per-inspection-line licensing model for Tier-1 suppliers'
      ], x: 635
    }
  ];

  phases.forEach(ph => {
    doc.roundedRect(ph.x, 145, 275, 340, 8).fillAndStroke(C.CARD_LIGHT, C.CARD_LIGHT_BORDER);
    doc.fillColor(C.RED_PRIMARY).fontSize(10).font('Helvetica-Bold').text(ph.p, ph.x + 20, 165);
    doc.fillColor(C.TEXT_DARK).fontSize(13.5).font('Helvetica-Bold').text(ph.t, ph.x + 20, 185);

    let phY = 225;
    ph.bullets.forEach(b => {
      doc.fillColor(C.TEXT_DARK).fontSize(12).font('Helvetica').text(`•  ${b}`, ph.x + 20, phY, { width: 235, lineGap: 5 });
      phY += 60;
    });
  });

  // --- SLIDE 9 ---
  doc.addPage();
  doc.rect(0, 0, 960, 540).fill(C.BG_DARK);

  doc.fillColor(C.TEXT_LIGHT).fontSize(10).font('Helvetica-Bold').text('ATMIYA UNIVERSITY', 45, 25);
  doc.fillColor(C.TEXT_LIGHT_MUTED).fontSize(8).font('Helvetica').text('RAJKOT, GUJARAT (INDIA)', 45, 38);
  doc.fillColor(C.RED_ACCENT).fontSize(12).font('Helvetica-Bold').text('RIT   |   ADSC', 750, 25, { width: 165, align: 'right' });
  doc.rect(45, 68, 870, 2).fill(C.RED_PRIMARY);

  doc.fillColor(C.RED_ACCENT).fontSize(11).font('Helvetica-Bold').text('08 · THE VAULT', 45, 82);
  doc.fillColor(C.TEXT_LIGHT).fontSize(22).font('Helvetica-Bold').text('GITHUB REPOSITORY LINK', 45, 102);

  // Link Card
  doc.roundedRect(45, 145, 870, 75, 8).fillAndStroke(C.CARD_DARK, C.RED_ACCENT);
  doc.fillColor(C.TEXT_LIGHT).fontSize(18).font('Courier-Bold').text('https://github.com/[username]/[repository]', 70, 172);

  // 4 Checklist Cards
  const chCards = [
    { title: 'PUBLIC', desc: 'Repository visibility is set to public with complete open-source reproduction steps.', x: 45 },
    { title: 'README', desc: 'Covers setup steps, 15 failure modes, system architecture, decision rules, and team.', x: 270 },
    { title: 'COMMITS', desc: 'Regular commits, pull requests, and verified contributions from every team member.', x: 495 },
    { title: 'DEMO (OPTIONAL)', desc: '[Live link or demo video link]', x: 720 }
  ];

  chCards.forEach(c => {
    doc.roundedRect(c.x, 245, 195, 220, 8).fillAndStroke(C.CARD_DARK, C.CARD_DARK_BORDER);
    doc.fillColor(C.RED_ACCENT).fontSize(13).font('Helvetica-Bold').text(c.title, c.x + 18, 270);
    doc.fillColor(C.TEXT_LIGHT_MUTED).fontSize(11.5).font('Helvetica').text(c.desc, c.x + 18, 305, { width: 160, lineGap: 4 });
  });

  doc.fillColor(C.TEXT_MUTED).fontSize(9).font('Helvetica').text('Code Carnival 3.0 · ADSC, Atmiya University', 45, 508);
  doc.fillColor(C.RED_ACCENT).fontSize(10).font('Helvetica-Bold').text('[TEAM NAME]', 750, 508, { width: 165, align: 'right' });

  doc.end();

  return new Promise((resolve) => {
    stream.on('finish', () => {
      console.log(`[✓] PDF successfully generated: ${outputPath}`);
      resolve();
    });
  });
}

async function main() {
  console.log('[*] Generating PowerPoint Presentation (.pptx)...');
  await generatePPTX();
  console.log('[*] Generating PDF Preview (.pdf)...');
  await generatePDF();
  console.log('[✓] All presentations generated successfully.');
}

main().catch(err => {
  console.error('[!] Error generating presentation:', err);
  process.exit(1);
});
