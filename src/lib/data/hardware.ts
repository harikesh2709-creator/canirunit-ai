import { HardwareSpec } from '../types';

// ============================================================================
// Hardware Presets — Comprehensive GPU Database
// ============================================================================

// --- NVIDIA GeForce (Consumer Desktop) ---
const nvidiaGeForce: HardwareSpec[] = [
  // 10-series & Titan
  { id: 'gtx-1070', name: 'NVIDIA GTX 1070 8GB', platform: 'nvidia', vramGB: 8, bandwidthGBs: 256, fp32TFLOPS: 6.5, busWidth: 256 },
  { id: 'gtx-1080', name: 'NVIDIA GTX 1080 8GB', platform: 'nvidia', vramGB: 8, bandwidthGBs: 320, fp32TFLOPS: 8.9, busWidth: 256 },
  { id: 'gtx-1080-ti', name: 'NVIDIA GTX 1080 Ti 11GB', platform: 'nvidia', vramGB: 11, bandwidthGBs: 484, fp32TFLOPS: 11.3, busWidth: 352 },
  { id: 'titan-xp', name: 'NVIDIA Titan Xp 12GB', platform: 'nvidia', vramGB: 12, bandwidthGBs: 548, fp32TFLOPS: 12.1, busWidth: 384 },
  
  // 16-series
  { id: 'gtx-1650', name: 'NVIDIA GTX 1650 4GB', platform: 'nvidia', vramGB: 4, bandwidthGBs: 128, fp32TFLOPS: 3.0, busWidth: 128 },
  { id: 'gtx-1660', name: 'NVIDIA GTX 1660 6GB', platform: 'nvidia', vramGB: 6, bandwidthGBs: 192, fp32TFLOPS: 5.0, busWidth: 192 },
  { id: 'gtx-1660-ti', name: 'NVIDIA GTX 1660 Ti 6GB', platform: 'nvidia', vramGB: 6, bandwidthGBs: 288, fp32TFLOPS: 5.4, busWidth: 192 },

  // 20-series & Titan
  { id: 'rtx-2050', name: 'NVIDIA RTX 2050 4GB (Mobile)', platform: 'nvidia', vramGB: 4, bandwidthGBs: 112, fp32TFLOPS: 4.8, busWidth: 64 },
  { id: 'rtx-2060-6gb', name: 'NVIDIA RTX 2060 6GB', platform: 'nvidia', vramGB: 6, bandwidthGBs: 336, fp32TFLOPS: 6.5, busWidth: 192 },
  { id: 'rtx-2060-12gb', name: 'NVIDIA RTX 2060 12GB', platform: 'nvidia', vramGB: 12, bandwidthGBs: 336, fp32TFLOPS: 6.5, busWidth: 192 },
  { id: 'rtx-2070', name: 'NVIDIA RTX 2070 8GB', platform: 'nvidia', vramGB: 8, bandwidthGBs: 448, fp32TFLOPS: 7.5, busWidth: 256 },
  { id: 'rtx-2080', name: 'NVIDIA RTX 2080 8GB', platform: 'nvidia', vramGB: 8, bandwidthGBs: 448, fp32TFLOPS: 10.1, busWidth: 256 },
  { id: 'rtx-2080-ti', name: 'NVIDIA RTX 2080 Ti 11GB', platform: 'nvidia', vramGB: 11, bandwidthGBs: 616, fp32TFLOPS: 13.4, busWidth: 352 },
  { id: 'titan-rtx', name: 'NVIDIA Titan RTX 24GB', platform: 'nvidia', vramGB: 24, bandwidthGBs: 672, fp32TFLOPS: 16.3, busWidth: 384 },
  
  // 30-series
  { id: 'rtx-3050-4gb', name: 'NVIDIA RTX 3050 4GB', platform: 'nvidia', vramGB: 4, bandwidthGBs: 192, fp32TFLOPS: 4.6, busWidth: 128 },
  { id: 'rtx-3050-6gb', name: 'NVIDIA RTX 3050 6GB', platform: 'nvidia', vramGB: 6, bandwidthGBs: 168, fp32TFLOPS: 4.7, busWidth: 96 },
  { id: 'rtx-3050-8gb', name: 'NVIDIA RTX 3050 8GB', platform: 'nvidia', vramGB: 8, bandwidthGBs: 224, fp32TFLOPS: 9.0, busWidth: 128 },
  { id: 'rtx-3050-ti', name: 'NVIDIA RTX 3050 Ti 4GB (Mobile)', platform: 'nvidia', vramGB: 4, bandwidthGBs: 192, fp32TFLOPS: 5.3, busWidth: 128 },
  { id: 'rtx-3060-8gb', name: 'NVIDIA RTX 3060 8GB', platform: 'nvidia', vramGB: 8, bandwidthGBs: 240, fp32TFLOPS: 12.7, busWidth: 128 },
  { id: 'rtx-3060-12gb', name: 'NVIDIA RTX 3060 12GB', platform: 'nvidia', vramGB: 12, bandwidthGBs: 360, fp32TFLOPS: 12.7, busWidth: 192 },
  { id: 'rtx-3060-ti', name: 'NVIDIA RTX 3060 Ti 8GB', platform: 'nvidia', vramGB: 8, bandwidthGBs: 448, fp32TFLOPS: 16.2, busWidth: 256 },
  { id: 'rtx-3070', name: 'NVIDIA RTX 3070 8GB', platform: 'nvidia', vramGB: 8, bandwidthGBs: 448, fp32TFLOPS: 20.3, busWidth: 256 },
  { id: 'rtx-3070-ti', name: 'NVIDIA RTX 3070 Ti 8GB', platform: 'nvidia', vramGB: 8, bandwidthGBs: 608, fp32TFLOPS: 21.7, busWidth: 256 },
  { id: 'rtx-3080-10gb', name: 'NVIDIA RTX 3080 10GB', platform: 'nvidia', vramGB: 10, bandwidthGBs: 760, fp32TFLOPS: 29.8, busWidth: 320 },
  { id: 'rtx-3080-12gb', name: 'NVIDIA RTX 3080 12GB', platform: 'nvidia', vramGB: 12, bandwidthGBs: 912, fp32TFLOPS: 30.6, busWidth: 384 },
  { id: 'rtx-3080-ti', name: 'NVIDIA RTX 3080 Ti 12GB', platform: 'nvidia', vramGB: 12, bandwidthGBs: 912, fp32TFLOPS: 34.1, busWidth: 384 },
  { id: 'rtx-3090', name: 'NVIDIA RTX 3090 24GB', platform: 'nvidia', vramGB: 24, bandwidthGBs: 936, fp32TFLOPS: 35.6, busWidth: 384 },
  { id: 'rtx-3090-ti', name: 'NVIDIA RTX 3090 Ti 24GB', platform: 'nvidia', vramGB: 24, bandwidthGBs: 1008, fp32TFLOPS: 40.0, busWidth: 384 },
  
  // 40-series
  { id: 'rtx-4050', name: 'NVIDIA RTX 4050 6GB', platform: 'nvidia', vramGB: 6, bandwidthGBs: 192, fp32TFLOPS: 8.9, busWidth: 96 },
  { id: 'rtx-4060', name: 'NVIDIA RTX 4060 8GB', platform: 'nvidia', vramGB: 8, bandwidthGBs: 272, fp32TFLOPS: 15.1, busWidth: 128 },
  { id: 'rtx-4060-ti-8gb', name: 'NVIDIA RTX 4060 Ti 8GB', platform: 'nvidia', vramGB: 8, bandwidthGBs: 288, fp32TFLOPS: 22.1, busWidth: 128 },
  { id: 'rtx-4060-ti-16gb', name: 'NVIDIA RTX 4060 Ti 16GB', platform: 'nvidia', vramGB: 16, bandwidthGBs: 288, fp32TFLOPS: 22.1, busWidth: 128 },
  { id: 'rtx-4070', name: 'NVIDIA RTX 4070 12GB', platform: 'nvidia', vramGB: 12, bandwidthGBs: 504, fp32TFLOPS: 29.1, busWidth: 192 },
  { id: 'rtx-4070-super', name: 'NVIDIA RTX 4070 Super 12GB', platform: 'nvidia', vramGB: 12, bandwidthGBs: 504, fp32TFLOPS: 35.5, busWidth: 192 },
  { id: 'rtx-4070-ti', name: 'NVIDIA RTX 4070 Ti 12GB', platform: 'nvidia', vramGB: 12, bandwidthGBs: 504, fp32TFLOPS: 40.1, busWidth: 192 },
  { id: 'rtx-4070-ti-super', name: 'NVIDIA RTX 4070 Ti Super 16GB', platform: 'nvidia', vramGB: 16, bandwidthGBs: 672, fp32TFLOPS: 44.1, busWidth: 256 },
  { id: 'rtx-4080', name: 'NVIDIA RTX 4080 16GB', platform: 'nvidia', vramGB: 16, bandwidthGBs: 717, fp32TFLOPS: 48.7, busWidth: 256 },
  { id: 'rtx-4080-super', name: 'NVIDIA RTX 4080 Super 16GB', platform: 'nvidia', vramGB: 16, bandwidthGBs: 736, fp32TFLOPS: 52.2, busWidth: 256 },
  { id: 'rtx-4090', name: 'NVIDIA RTX 4090 24GB', platform: 'nvidia', vramGB: 24, bandwidthGBs: 1008, fp32TFLOPS: 82.6, busWidth: 384 },
  
  // 50-series
  { id: 'rtx-5060', name: 'NVIDIA RTX 5060 8GB', platform: 'nvidia', vramGB: 8, bandwidthGBs: 448, fp32TFLOPS: 20.0, busWidth: 128 },
  { id: 'rtx-5060-ti', name: 'NVIDIA RTX 5060 Ti 16GB', platform: 'nvidia', vramGB: 16, bandwidthGBs: 448, fp32TFLOPS: 25.0, busWidth: 128 },
  { id: 'rtx-5070', name: 'NVIDIA RTX 5070 12GB', platform: 'nvidia', vramGB: 12, bandwidthGBs: 672, fp32TFLOPS: 40.0, busWidth: 192 },
  { id: 'rtx-5070-ti', name: 'NVIDIA RTX 5070 Ti 16GB', platform: 'nvidia', vramGB: 16, bandwidthGBs: 896, fp32TFLOPS: 55.0, busWidth: 256 },
  { id: 'rtx-5080', name: 'NVIDIA RTX 5080 16GB', platform: 'nvidia', vramGB: 16, bandwidthGBs: 960, fp32TFLOPS: 70.0, busWidth: 256 },
  { id: 'rtx-5090', name: 'NVIDIA RTX 5090 32GB', platform: 'nvidia', vramGB: 32, bandwidthGBs: 1792, fp32TFLOPS: 110.0, busWidth: 512 },
];

// --- NVIDIA Workstation / Data Center ---
const nvidiaWorkstation: HardwareSpec[] = [
  { id: 'rtx-a4000', name: 'NVIDIA RTX A4000 16GB', platform: 'nvidia', vramGB: 16, bandwidthGBs: 448, fp32TFLOPS: 19.2, busWidth: 256 },
  { id: 'rtx-a5000', name: 'NVIDIA RTX A5000 24GB', platform: 'nvidia', vramGB: 24, bandwidthGBs: 768, fp32TFLOPS: 27.8, busWidth: 384 },
  { id: 'rtx-a6000', name: 'NVIDIA RTX A6000 48GB', platform: 'nvidia', vramGB: 48, bandwidthGBs: 768, fp32TFLOPS: 38.7, busWidth: 384 },
  { id: 'a100-40gb', name: 'NVIDIA A100 40GB', platform: 'nvidia', vramGB: 40, bandwidthGBs: 1555, fp32TFLOPS: 19.5, busWidth: 5120 },
  { id: 'a100-80gb', name: 'NVIDIA A100 80GB', platform: 'nvidia', vramGB: 80, bandwidthGBs: 2039, fp32TFLOPS: 19.5, busWidth: 5120 },
  { id: 'h100-80gb', name: 'NVIDIA H100 80GB', platform: 'nvidia', vramGB: 80, bandwidthGBs: 3350, fp32TFLOPS: 67.0, busWidth: 5120 },
  { id: 'h200-141gb', name: 'NVIDIA H200 141GB', platform: 'nvidia', vramGB: 141, bandwidthGBs: 4800, fp32TFLOPS: 67.0, busWidth: 5120 },
  { id: 'l40s', name: 'NVIDIA L40S 48GB', platform: 'nvidia', vramGB: 48, bandwidthGBs: 864, fp32TFLOPS: 91.6, busWidth: 384 },
  { id: 'rtx-6000-ada', name: 'NVIDIA RTX 6000 Ada 48GB', platform: 'nvidia', vramGB: 48, bandwidthGBs: 960, fp32TFLOPS: 91.1, busWidth: 384 },
  { id: 'rtx-5000-ada', name: 'NVIDIA RTX 5000 Ada 32GB', platform: 'nvidia', vramGB: 32, bandwidthGBs: 576, fp32TFLOPS: 65.3, busWidth: 256 },
  { id: 'rtx-4000-ada', name: 'NVIDIA RTX 4000 Ada 20GB', platform: 'nvidia', vramGB: 20, bandwidthGBs: 360, fp32TFLOPS: 26.7, busWidth: 160 },
];

// --- AMD Radeon (Consumer Desktop) ---
const amdGPUs: HardwareSpec[] = [
  // Integrated
  { id: 'amd-radeon-graphics', name: 'AMD Radeon Graphics (Integrated)', platform: 'amd', vramGB: 8, bandwidthGBs: 60, fp32TFLOPS: 2.0, busWidth: 128, isIntegrated: true },

  // 6000 series
  { id: 'rx-6600', name: 'AMD RX 6600 8GB', platform: 'amd', vramGB: 8, bandwidthGBs: 224, fp32TFLOPS: 8.9, busWidth: 128 },
  { id: 'rx-6700-xt', name: 'AMD RX 6700 XT 12GB', platform: 'amd', vramGB: 12, bandwidthGBs: 384, fp32TFLOPS: 13.2, busWidth: 192 },
  { id: 'rx-6800-xt', name: 'AMD RX 6800 XT 16GB', platform: 'amd', vramGB: 16, bandwidthGBs: 512, fp32TFLOPS: 20.7, busWidth: 256 },
  { id: 'rx-6900-xt', name: 'AMD RX 6900 XT 16GB', platform: 'amd', vramGB: 16, bandwidthGBs: 512, fp32TFLOPS: 23.0, busWidth: 256 },

  // 7000 series
  { id: 'rx-7600', name: 'AMD RX 7600 8GB', platform: 'amd', vramGB: 8, bandwidthGBs: 288, fp32TFLOPS: 21.7, busWidth: 128 },
  { id: 'rx-7600-xt', name: 'AMD RX 7600 XT 16GB', platform: 'amd', vramGB: 16, bandwidthGBs: 288, fp32TFLOPS: 22.5, busWidth: 128 },
  { id: 'rx-7700-xt', name: 'AMD RX 7700 XT 12GB', platform: 'amd', vramGB: 12, bandwidthGBs: 432, fp32TFLOPS: 35.1, busWidth: 192 },
  { id: 'rx-7800-xt', name: 'AMD RX 7800 XT 16GB', platform: 'amd', vramGB: 16, bandwidthGBs: 624, fp32TFLOPS: 37.3, busWidth: 256 },
  { id: 'rx-7900-gre', name: 'AMD RX 7900 GRE 16GB', platform: 'amd', vramGB: 16, bandwidthGBs: 576, fp32TFLOPS: 46.0, busWidth: 256 },
  { id: 'rx-7900-xt', name: 'AMD RX 7900 XT 20GB', platform: 'amd', vramGB: 20, bandwidthGBs: 800, fp32TFLOPS: 51.6, busWidth: 320 },
  { id: 'rx-7900-xtx', name: 'AMD RX 7900 XTX 24GB', platform: 'amd', vramGB: 24, bandwidthGBs: 960, fp32TFLOPS: 61.4, busWidth: 384 },
  
  // 9000 series & Workstation
  { id: 'rx-9070', name: 'AMD RX 9070 16GB', platform: 'amd', vramGB: 16, bandwidthGBs: 608, fp32TFLOPS: 45.0, busWidth: 256 },
  { id: 'rx-9070-xt', name: 'AMD RX 9070 XT 16GB', platform: 'amd', vramGB: 16, bandwidthGBs: 672, fp32TFLOPS: 50.0, busWidth: 256 },
  { id: 'w7900', name: 'AMD Radeon PRO W7900 48GB', platform: 'amd', vramGB: 48, bandwidthGBs: 864, fp32TFLOPS: 61.4, busWidth: 384 },
  { id: 'mi300x', name: 'AMD Instinct MI300X 192GB', platform: 'amd', vramGB: 192, bandwidthGBs: 5300, fp32TFLOPS: 163.4, busWidth: 8192 },
];

// --- Intel Arc ---
const intelGPUs: HardwareSpec[] = [
  // Arc Alchemist
  { id: 'arc-a750-8gb', name: 'Intel Arc A750 8GB', platform: 'intel', vramGB: 8, bandwidthGBs: 512, fp32TFLOPS: 14.3, busWidth: 256, isIntegrated: false },
  { id: 'arc-a770-16gb', name: 'Intel Arc A770 16GB', platform: 'intel', vramGB: 16, bandwidthGBs: 512, fp32TFLOPS: 19.6, busWidth: 256, isIntegrated: false },
  // Arc Battlemage
  { id: 'arc-b580', name: 'Intel Arc B580 12GB', platform: 'intel', vramGB: 12, bandwidthGBs: 456, fp32TFLOPS: 24.0, busWidth: 192, isIntegrated: false },
  // Intel Iris / UHD
  { id: 'intel-iris-xe', name: 'Intel Iris Xe', platform: 'intel', vramGB: 8, bandwidthGBs: 60, fp32TFLOPS: 1.6, busWidth: 128, isIntegrated: true },
];

// --- Apple Silicon ---
const appleGPUs: HardwareSpec[] = [
  // M1 Series
  { id: 'm1-8gb', name: 'Apple M1 8GB', platform: 'apple', vramGB: 8, bandwidthGBs: 68, fp32TFLOPS: 2.6, busWidth: 128, isIntegrated: true },
  { id: 'm1-16gb', name: 'Apple M1 16GB', platform: 'apple', vramGB: 16, bandwidthGBs: 68, fp32TFLOPS: 2.6, busWidth: 128, isIntegrated: true },
  { id: 'm1-pro-16gb', name: 'Apple M1 Pro 16GB', platform: 'apple', vramGB: 16, bandwidthGBs: 200, fp32TFLOPS: 5.2, busWidth: 256, isIntegrated: true },
  { id: 'm1-pro-32gb', name: 'Apple M1 Pro 32GB', platform: 'apple', vramGB: 32, bandwidthGBs: 200, fp32TFLOPS: 5.2, busWidth: 256, isIntegrated: true },
  { id: 'm1-max-32gb', name: 'Apple M1 Max 32GB', platform: 'apple', vramGB: 32, bandwidthGBs: 400, fp32TFLOPS: 10.4, busWidth: 512, isIntegrated: true },
  { id: 'm1-max-64gb', name: 'Apple M1 Max 64GB', platform: 'apple', vramGB: 64, bandwidthGBs: 400, fp32TFLOPS: 10.4, busWidth: 512, isIntegrated: true },
  { id: 'm1-ultra-64gb', name: 'Apple M1 Ultra 64GB', platform: 'apple', vramGB: 64, bandwidthGBs: 800, fp32TFLOPS: 21.0, busWidth: 1024, isIntegrated: true },
  { id: 'm1-ultra-128gb', name: 'Apple M1 Ultra 128GB', platform: 'apple', vramGB: 128, bandwidthGBs: 800, fp32TFLOPS: 21.0, busWidth: 1024, isIntegrated: true },
  
  // M2 Series
  { id: 'm2-8gb', name: 'Apple M2 8GB', platform: 'apple', vramGB: 8, bandwidthGBs: 100, fp32TFLOPS: 3.6, busWidth: 128, isIntegrated: true },
  { id: 'm2-16gb', name: 'Apple M2 16GB', platform: 'apple', vramGB: 16, bandwidthGBs: 100, fp32TFLOPS: 3.6, busWidth: 128, isIntegrated: true },
  { id: 'm2-24gb', name: 'Apple M2 24GB', platform: 'apple', vramGB: 24, bandwidthGBs: 100, fp32TFLOPS: 3.6, busWidth: 128, isIntegrated: true },
  { id: 'm2-pro-16gb', name: 'Apple M2 Pro 16GB', platform: 'apple', vramGB: 16, bandwidthGBs: 200, fp32TFLOPS: 6.8, busWidth: 256, isIntegrated: true },
  { id: 'm2-pro-32gb', name: 'Apple M2 Pro 32GB', platform: 'apple', vramGB: 32, bandwidthGBs: 200, fp32TFLOPS: 6.8, busWidth: 256, isIntegrated: true },
  { id: 'm2-max-32gb', name: 'Apple M2 Max 32GB', platform: 'apple', vramGB: 32, bandwidthGBs: 400, fp32TFLOPS: 13.6, busWidth: 512, isIntegrated: true },
  { id: 'm2-max-64gb', name: 'Apple M2 Max 64GB', platform: 'apple', vramGB: 64, bandwidthGBs: 400, fp32TFLOPS: 13.6, busWidth: 512, isIntegrated: true },
  { id: 'm2-max-96gb', name: 'Apple M2 Max 96GB', platform: 'apple', vramGB: 96, bandwidthGBs: 400, fp32TFLOPS: 13.6, busWidth: 512, isIntegrated: true },
  { id: 'm2-ultra-64gb', name: 'Apple M2 Ultra 64GB', platform: 'apple', vramGB: 64, bandwidthGBs: 800, fp32TFLOPS: 27.2, busWidth: 1024, isIntegrated: true },
  { id: 'm2-ultra-128gb', name: 'Apple M2 Ultra 128GB', platform: 'apple', vramGB: 128, bandwidthGBs: 800, fp32TFLOPS: 27.2, busWidth: 1024, isIntegrated: true },
  { id: 'm2-ultra-192gb', name: 'Apple M2 Ultra 192GB', platform: 'apple', vramGB: 192, bandwidthGBs: 800, fp32TFLOPS: 27.2, busWidth: 1024, isIntegrated: true },
  
  // M3 Series
  { id: 'm3-8gb', name: 'Apple M3 8GB', platform: 'apple', vramGB: 8, bandwidthGBs: 100, fp32TFLOPS: 4.1, busWidth: 128, isIntegrated: true },
  { id: 'm3-16gb', name: 'Apple M3 16GB', platform: 'apple', vramGB: 16, bandwidthGBs: 100, fp32TFLOPS: 4.1, busWidth: 128, isIntegrated: true },
  { id: 'm3-24gb', name: 'Apple M3 24GB', platform: 'apple', vramGB: 24, bandwidthGBs: 100, fp32TFLOPS: 4.1, busWidth: 128, isIntegrated: true },
  { id: 'm3-pro-18gb', name: 'Apple M3 Pro 18GB', platform: 'apple', vramGB: 18, bandwidthGBs: 150, fp32TFLOPS: 7.8, busWidth: 192, isIntegrated: true },
  { id: 'm3-pro-36gb', name: 'Apple M3 Pro 36GB', platform: 'apple', vramGB: 36, bandwidthGBs: 150, fp32TFLOPS: 7.8, busWidth: 192, isIntegrated: true },
  { id: 'm3-max-36gb', name: 'Apple M3 Max 36GB', platform: 'apple', vramGB: 36, bandwidthGBs: 300, fp32TFLOPS: 15.6, busWidth: 384, isIntegrated: true },
  { id: 'm3-max-48gb', name: 'Apple M3 Max 48GB', platform: 'apple', vramGB: 48, bandwidthGBs: 300, fp32TFLOPS: 15.6, busWidth: 384, isIntegrated: true },
  { id: 'm3-max-64gb', name: 'Apple M3 Max 64GB', platform: 'apple', vramGB: 64, bandwidthGBs: 400, fp32TFLOPS: 15.6, busWidth: 512, isIntegrated: true },
  { id: 'm3-max-128gb', name: 'Apple M3 Max 128GB', platform: 'apple', vramGB: 128, bandwidthGBs: 400, fp32TFLOPS: 15.6, busWidth: 512, isIntegrated: true },
  
  // M4 Series
  { id: 'm4-16gb', name: 'Apple M4 16GB', platform: 'apple', vramGB: 16, bandwidthGBs: 120, fp32TFLOPS: 5.0, busWidth: 128, isIntegrated: true },
  { id: 'm4-24gb', name: 'Apple M4 24GB', platform: 'apple', vramGB: 24, bandwidthGBs: 120, fp32TFLOPS: 5.0, busWidth: 128, isIntegrated: true },
  { id: 'm4-32gb', name: 'Apple M4 32GB', platform: 'apple', vramGB: 32, bandwidthGBs: 120, fp32TFLOPS: 5.0, busWidth: 128, isIntegrated: true },
  { id: 'm4-pro-24gb', name: 'Apple M4 Pro 24GB', platform: 'apple', vramGB: 24, bandwidthGBs: 273, fp32TFLOPS: 10.0, busWidth: 256, isIntegrated: true },
  { id: 'm4-pro-48gb', name: 'Apple M4 Pro 48GB', platform: 'apple', vramGB: 48, bandwidthGBs: 273, fp32TFLOPS: 10.0, busWidth: 256, isIntegrated: true },
  { id: 'm4-max-36gb', name: 'Apple M4 Max 36GB', platform: 'apple', vramGB: 36, bandwidthGBs: 546, fp32TFLOPS: 20.0, busWidth: 512, isIntegrated: true },
  { id: 'm4-max-64gb', name: 'Apple M4 Max 64GB', platform: 'apple', vramGB: 64, bandwidthGBs: 546, fp32TFLOPS: 20.0, busWidth: 512, isIntegrated: true },
  { id: 'm4-max-128gb', name: 'Apple M4 Max 128GB', platform: 'apple', vramGB: 128, bandwidthGBs: 546, fp32TFLOPS: 20.0, busWidth: 512, isIntegrated: true },
  { id: 'm4-ultra-128gb', name: 'Apple M4 Ultra 128GB', platform: 'apple', vramGB: 128, bandwidthGBs: 819, fp32TFLOPS: 40.0, busWidth: 1024, isIntegrated: true },
  { id: 'm4-ultra-192gb', name: 'Apple M4 Ultra 192GB', platform: 'apple', vramGB: 192, bandwidthGBs: 819, fp32TFLOPS: 40.0, busWidth: 1024, isIntegrated: true },
  { id: 'm4-ultra-256gb', name: 'Apple M4 Ultra 256GB', platform: 'apple', vramGB: 256, bandwidthGBs: 819, fp32TFLOPS: 40.0, busWidth: 1024, isIntegrated: true },
];

// --- Custom Hardware ---
const customHardware: HardwareSpec = {
  id: 'custom',
  name: 'Custom Configuration',
  platform: 'custom',
  vramGB: 24,
  bandwidthGBs: 500,
};

// ============================================================================
// Exports
// ============================================================================

export const HARDWARE_PRESETS: HardwareSpec[] = [
  ...nvidiaGeForce,
  ...nvidiaWorkstation,
  ...amdGPUs,
  ...intelGPUs,
  ...appleGPUs,
  customHardware,
];

export const HARDWARE_GROUPS = [
  { label: 'NVIDIA GeForce', items: nvidiaGeForce },
  { label: 'NVIDIA Workstation / Data Center', items: nvidiaWorkstation },
  { label: 'AMD Radeon', items: amdGPUs },
  { label: 'Intel Arc', items: intelGPUs },
  { label: 'Apple Silicon', items: appleGPUs },
  { label: 'Custom', items: [customHardware] },
];

export function getHardwareById(id: string): HardwareSpec | undefined {
  return HARDWARE_PRESETS.find((h) => h.id === id);
}
