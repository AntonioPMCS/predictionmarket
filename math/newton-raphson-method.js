'use strict';

function newtonRaphson (f, fp, x0, options) {
  var x1, y, yp, tol, maxIter, iter, yph, ymh, yp2h, ym2h, h, hr, verbose, eps;

  // Iterpret variadic forms:
  if (typeof fp !== 'function') {
    options = x0;
    x0 = fp;
    fp = null;
  }

  options = options || {};
  tol = options.tolerance === undefined ? 1e-7 : options.tolerance;
  eps = options.epsilon === undefined ? 2.220446049250313e-16 : options.epsilon;
  maxIter = options.maxIterations === undefined ? 20 : options.maxIterations;
  h = options.h === undefined ? 1e-4 : options.h;
  verbose = options.verbose === undefined ? false : options.verbose;
  hr = 1 / h;

  iter = 0;
  while (iter++ < maxIter) {
    // Compute the value of the function:
    y = f(x0);

    if (fp) {
      yp = fp(x0);
    } else {
      // Needs numerical derivatives:
      yph = f(x0 + h);
      ymh = f(x0 - h);
      yp2h = f(x0 + 2 * h);
      ym2h = f(x0 - 2 * h);

      yp = ((ym2h - yp2h) + 8 * (yph - ymh)) * hr / 12;
    }

    // Check for badly conditioned update (extremely small first deriv relative to function):
    if (Math.abs(yp) <= eps * Math.abs(y)) {
      if (verbose) {
        console.log('Newton-Raphson: failed to converged due to nearly zero first derivative');
      }
      return false;
    }

    // Update the guess:
    x1 = x0 - y / yp;

    // Check for convergence:
    if (Math.abs(x1 - x0) <= tol * Math.abs(x1)) {
      if (verbose) {
        console.log('Newton-Raphson: converged to x = ' + x1 + ' after ' + iter + ' iterations');
      }
      return x1;
    }

    // Transfer update to the new guess:
    x0 = x1;
  }

  if (verbose) {
    console.log('Newton-Raphson: Maximum iterations reached (' + maxIter + ')');
  }

  return false;
}


/*'use strict';

const big_js_1 = Big;
big_js_1.default.DP = 100;
function newtonRaphson(f, x0, options, fp) {
    var x1, y, yp, tol, maxIter, iter, yph, ymh, yp2h, ym2h, h, hr, verbose;
    options = options || {};
    tol = new big_js_1.default(options.tolerance === undefined ? 1e-7 : options.tolerance);
    maxIter = options.maxIterations === undefined ? 20 : options.maxIterations;
    h = new big_js_1.default(options.h === undefined ? 1e-4 : options.h);
    verbose = options.verbose === undefined ? false : options.verbose;
    hr = new big_js_1.default(1).div(h);
    x0 = new big_js_1.default(x0);
    iter = 0;
    while (iter++ < maxIter) {
        // Compute the value of the function:
        y = f(x0);
        if (fp) {
            yp = fp(x0);
        }
        else {
            // Needs numerical derivatives:
            yph = f(x0.plus(h));
            ymh = f(x0.minus(h));
            yp2h = f(x0.plus(h.mul(2)));
            ym2h = f(x0.minus(h.mul(2)));
            yp = ym2h
                .minus(yp2h)
                .plus(new big_js_1.default(8).mul(yph.minus(ymh)))
                .mul(hr)
                .div(12);
        }
        // Update the guess:
        x1 = x0.minus(y.div(yp));
        // Check for convergence:
        if (x1
            .minus(x0)
            .abs()
            .lte(tol.mul(x1.abs()))) {
            if (verbose) {
                console.log('Newton-Raphson: converged to x = ' + x1 + ' after ' + iter + ' iterations');
            }
            return x1;
        }
        // Transfer update to the new guess:
        x0 = x1;
    }
    if (verbose) {
        console.log('Newton-Raphson: Maximum iterations reached (' + maxIter + ')');
    }
    return false;
}*/