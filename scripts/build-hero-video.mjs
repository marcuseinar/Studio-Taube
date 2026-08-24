/**
 * Builds the hero loop from brand/source/head-spa-master.mp4.
 *
 * Two decisions are encoded here and both matter:
 *
 * 1. Only segments without a recognisable client are used. The master shows a
 *    client's face for much of its length and no consent is on file — see
 *    brand/CONSENT.md.
 * 2. The two segments are joined through white, and the loop fades from and to
 *    white, so the seam where it repeats is invisible. The master's own cut is
 *    a white wipe, so this matches the footage rather than fighting it.
 *
 * Run with `npm run build:video` after replacing the master. The derived files
 * are committed, so a normal build never needs ffmpeg.
 */
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import ffmpeg from 'ffmpeg-static';

const MASTER = 'brand/source/head-spa-master.mp4';
const OUT = 'public/video';

/** Shots with no identifiable face, picked by inspecting the master. */
const SEGMENTS = [
  { start: 2.4, duration: 3.0 }, // water fanning through the gold hoop
  { start: 30.0, duration: 4.5 }, // rinsing and combing under the hoop
];

const FPS = 25;

/*
 * The master is 9:16. Rendered into the hero's 4:5 frame, CSS object-cover
 * would crop it to an unreadable close-up, so the crop is made here where the
 * framing can be chosen: 720x900 from y=60 keeps the whole fan of water in the
 * first shot and the head and hoop in the second.
 */
const CROP = 'crop=720:900:0:60';
const DISSOLVE = 0.6;
const EDGE_FADE = 0.4;

const run = (args) => execFileSync(ffmpeg, ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const kb = (path) => `${Math.round(statSync(path).size / 1024)} kB`;

const [first, second] = SEGMENTS;
const joinAt = first.duration - DISSOLVE;
const total = first.duration + second.duration - DISSOLVE;

/*
 * fadewhite dissolves through white rather than through black, which suits
 * the bright studio and hides the join. -an drops the soundtrack: an autoplay
 * loop must be muted anyway, so the audio is pure weight.
 */
const filter = [
  // xfade requires a constant frame rate on both inputs, which a trim alone
  // does not guarantee.
  `[0:v]trim=start=${first.start}:duration=${first.duration},setpts=PTS-STARTPTS,${CROP},fps=${FPS},settb=AVTB[a]`,
  `[0:v]trim=start=${second.start}:duration=${second.duration},setpts=PTS-STARTPTS,${CROP},fps=${FPS},settb=AVTB[b]`,
  `[a][b]xfade=transition=fadewhite:duration=${DISSOLVE}:offset=${joinAt}[joined]`,
  `[joined]fade=t=in:st=0:d=${EDGE_FADE}:color=white,fade=t=out:st=${total - EDGE_FADE}:d=${EDGE_FADE}:color=white[out]`,
].join(';');

const common = ['-i', MASTER, '-filter_complex', filter, '-map', '[out]', '-an'];

/*
 * Two encodes, chosen by measurement on this footage rather than by habit.
 *
 * AV1 is 530 kB against H.264's 747 kB at matching quality, so modern
 * browsers get a 29% smaller file. H.264 stays as the fallback for everything
 * that cannot decode AV1, notably older Safari.
 *
 * VP9 was tried and rejected: 1890 kB at crf 36, 1456 at 40, 1018 at 45 where
 * quality is already visibly worse. Browsers would have preferred that WebM
 * over the MP4 and downloaded more, so shipping it would have made the page
 * slower. Fine-detail high-motion water simply suits AV1 and H.264 better.
 */
run([
  ...common,
  '-c:v',
  'libaom-av1',
  '-crf',
  '34',
  '-b:v',
  '0',
  '-cpu-used',
  '8',
  '-row-mt',
  '1',
  '-tiles',
  '2x2',
  '-pix_fmt',
  'yuv420p',
  '-movflags',
  '+faststart',
  `${OUT}/head-spa.av1.mp4`,
]);
run([
  ...common,
  '-c:v',
  'libx264',
  '-profile:v',
  'high',
  '-crf',
  '27',
  '-preset',
  'slow',
  '-pix_fmt',
  'yuv420p',
  '-movflags',
  '+faststart',
  `${OUT}/head-spa.mp4`,
]);

// The poster carries LCP, so it is taken after the fade-in has finished.
run([
  '-ss',
  String(first.start + EDGE_FADE + 0.2),
  '-i',
  MASTER,
  '-frames:v',
  '1',
  '-q:v',
  '3',
  `${OUT}/head-spa-poster.jpg`,
]);

console.log(`loop ${total.toFixed(1)}s`);
for (const file of ['head-spa.av1.mp4', 'head-spa.mp4', 'head-spa-poster.jpg']) {
  console.log(`  ${file.padEnd(22)} ${kb(`${OUT}/${file}`)}`);
}
