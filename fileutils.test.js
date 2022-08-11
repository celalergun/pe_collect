const fileutils = require('./fileutils');
const testdata = require('./testdata');

test('Test with an exe header', () =>{
    let res = fileutils.checkBuffer(testdata.exeHeader);
    expect(res.isPE).toBe(true);
    expect(res.hexHash).toBe('7abbdaa6ba259e9525ed6c918d899e5795a0591d89d103b0eb3012cdc0e400b8');
});

test('Test with a dll header', () =>{
    let res = fileutils.checkBuffer(testdata.dllHeader);
    expect(res.isPE).toBe(true);
    expect(res.hexHash).toBe('ea8e1847acf1f72792f90324394885b59e3345f2d0bf3d90081007e9ce8b0bb7');
});

test('Test with a pdf header', () =>{
    let res = fileutils.checkBuffer(testdata.pdfHeader);
    expect(res.isPE).toBe(false);
    expect(res.hexHash).toBe('343e48d1ce2aa5648804c122d60ca5754ba58e5275fa6f6cf6401368504b50e7');
});
