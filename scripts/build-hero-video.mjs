/**
 * Derives the hero loop from brand/source/head-spa-master.mp4.
 *
 * The master is a commissioned edit, so it is used whole and in its original
 * 9:16 framing rather than re-cut or cropped. Its first and last frames are
 * the same shot, so it already loops cleanly with no fade needed.
 *
 * The only change is dropping the audio: a hero that starts on its own has to
 * be muted to be allowed to play at all, so the soundtrack could never be
 * heard and would only add weight.
 *
 * Run with `npm run build:video` after replacing the master. The derived files
 * are committed, so a normal build never needs ffmpeg.
 */
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import ffmpeg from 'ffmpeg-static';

const MASTER = 'brand/source/head-spa-master.mp4';
const OUT = 'public/video';

const run = (args) => execFileSync(ffmpeg, ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const mb = (path) => `${(statSync(path).size / 1024 / 1024).toFixed(2)} MB`;

const common = ['-i', MASTER, '-an', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];

/*
 * AV1 first, H.264 behind it. Both were measured against VP9 on this footage,
 * which came out larger than either at every setting tried and would have been
 * the file browsers preferred.
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
  `${OUT}/head-spa.av1.mp4`,
]);
run([...common, '-c:v', 'libx264', '-profile:v', 'high', '-crf', '27', '-preset', 'slow', `${OUT}/head-spa.mp4`]);

// The poster is what the page's Largest Contentful Paint is measured on.
run(['-ss', '0.5', '-i', MASTER, '-frames:v', '1', '-q:v', '3', `${OUT}/head-spa-poster.jpg`]);

for (const file of ['head-spa.av1.mp4', 'head-spa.mp4', 'head-spa-poster.jpg']) {
  console.log(`  ${file.padEnd(22)} ${mb(`${OUT}/${file}`)}`);
}
