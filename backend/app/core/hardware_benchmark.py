"""
Hardware Benchmark Utility

Integrates the AI Open 2026 workshop benchmark_hardware() function
into ColonyAI's backend. Used to verify GPU availability and measure
inference throughput — critical for the Grand Final on Deka Notebook GPU.

Usage:
    from app.core.hardware_benchmark import check_gpu, benchmark_inference

    gpu_info = check_gpu()
    results = benchmark_inference(model, sample_input)
"""

import time
import logging
from typing import Optional

import torch

logger = logging.getLogger(__name__)


def check_gpu() -> dict:
    """
    Check GPU availability and return diagnostics.

    Workshop equivalent: device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    Returns:
        dict with keys: available, device_name, device_count, cuda_version, memory_allocated_gb
    """
    info = {
        "available": torch.cuda.is_available(),
        "device": "cuda" if torch.cuda.is_available() else "cpu",
        "device_name": None,
        "device_count": torch.cuda.device_count() if torch.cuda.is_available() else 0,
        "cuda_version": torch.version.cuda if torch.cuda.is_available() else None,
        "memory_allocated_gb": None,
    }

    if info["available"]:
        info["device_name"] = torch.cuda.get_device_name(0)
        info["memory_allocated_gb"] = round(
            torch.cuda.memory_allocated(0) / 1024**3, 2
        )

    return info


@torch.no_grad()
def benchmark_inference(
    model: torch.nn.Module,
    sample_input: torch.Tensor,
    num_warmup: int = 10,
    num_iterations: int = 100,
    device: Optional[str] = None,
) -> dict:
    """
    Benchmark model inference throughput.

    Workshop equivalent: benchmark_hardware(model, loader)

    Args:
        model: PyTorch model (any architecture)
        sample_input: Example input tensor matching model's expected shape
        num_warmup: Number of warmup iterations (GPU kernel init)
        num_iterations: Number of timed iterations
        device: Device to benchmark on (None = auto-detect)

    Returns:
        dict with: device, batch_size, throughput, avg_latency_ms, total_time
    """
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    dev = torch.device(device)
    bench_model = model.to(dev).eval()
    dummy = sample_input.to(dev)

    # Warmup
    for _ in range(num_warmup):
        _ = bench_model(dummy)
    if dev.type == "cuda":
        torch.cuda.synchronize()

    # Timed runs
    start = time.time()
    for _ in range(num_iterations):
        _ = bench_model(dummy)
    if dev.type == "cuda":
        torch.cuda.synchronize()
    elapsed = time.time() - start

    batch_size = sample_input.size(0)
    total_images = batch_size * num_iterations
    throughput = total_images / elapsed
    avg_latency_ms = (elapsed / num_iterations) * 1000

    results = {
        "device": device,
        "batch_size": batch_size,
        "total_images": total_images,
        "num_iterations": num_iterations,
        "total_time_sec": round(elapsed, 4),
        "throughput_img_per_sec": round(throughput, 2),
        "avg_latency_ms": round(avg_latency_ms, 2),
    }

    logger.info(
        "Benchmark [%s]: %.2f img/s, avg %.2f ms/image",
        device.upper(),
        throughput,
        avg_latency_ms,
    )

    return results


def benchmark_endpoint() -> dict:
    """
    Full diagnostic: GPU check + YOLO benchmark.

    Designed to be called from a FastAPI endpoint for live diagnostics
    during the Grand Final (e.g., verify Deka Notebook GPU is working).

    Returns:
        dict with gpu_info and benchmark (or error)
    """
    gpu_info = check_gpu()

    result = {"gpu_info": gpu_info, "benchmark": None, "error": None}

    try:
        from app.services.colony_detector_optimized import get_detector

        detector = get_detector()
        dummy_input = torch.randn(1, 3, 640, 640)

        result["benchmark"] = benchmark_inference(
            detector.model.model,
            dummy_input,
            num_warmup=5,
            num_iterations=50,
        )
    except Exception as e:
        logger.warning("Benchmark inference failed: %s", e)
        result["error"] = str(e)

    return result
